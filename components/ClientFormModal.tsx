
import React, { useState, useEffect, useRef } from 'react';
import { Client, RepresentativeData } from '../types';
import { X, Bot, Loader2, UploadCloud, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { extractClientInfoFromDocument, extractClientInfoFromImage } from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt'> | Client) => void;
  initialData: Client | null;
}

const emptyRepresentative: RepresentativeData = { name: '', motherName: '', fatherName: '', cpf: '', rg: '', rgIssuer: '', rgIssuerUF: '', dataEmissao: '', dateOfBirth: '', nacionalidade: '', naturalidade: '', estadoCivil: '', profissao: '' };
const initialFormData = { name: '', cpf: '', rg: '', rgIssuer: '', rgIssuerUF: '', dataEmissao: '', motherName: '', fatherName: '', dateOfBirth: '', nacionalidade: '', naturalidade: '', estadoCivil: '', profissao: '', legalRepresentative: emptyRepresentative, email: '', phone: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [repFile, setRepFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<'client' | 'rep' | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const repFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.178/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialFormData, ...initialData, dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '', dataEmissao: initialData.dataEmissao ? initialData.dataEmissao.split('T')[0] : '', legalRepresentative: initialData.legalRepresentative || emptyRepresentative });
    } else {
      setFormData(initialFormData);
    }
    setFile(null);
    setRepFile(null);
    setError('');
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        const underage = age < 18;
        setIsUnderage(underage);
        if (!underage) {
            setFormData(prev => ({ ...prev, legalRepresentative: emptyRepresentative }));
        }
    } else {
        setIsUnderage(false);
    }
  }, [formData.dateOfBirth]);

  const processFileWithAI = async (fileToProcess: File, type: 'client' | 'rep') => {
    if (!fileToProcess) return;
    setIsAnalyzing(type);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) throw new Error("Falha ao ler o arquivo.");
          let jsonString;
          if (fileToProcess.type.startsWith('image/')) {
            const base64String = (event.target.result as string).split(',')[1];
            jsonString = await extractClientInfoFromImage(base64String, fileToProcess.type);
          } else if (fileToProcess.type === 'application/pdf') {
            const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            const fullText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
            if (fullText.trim().length < 100) {
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if(context){
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    jsonString = await extractClientInfoFromImage(canvas.toDataURL('image/jpeg').split(',')[1], 'image/jpeg');
                } else { throw new Error("Não foi possível renderizar o PDF para análise."); }
            } else {
                jsonString = await extractClientInfoFromDocument(fullText);
            }
          } else { throw new Error("Formato de arquivo não suportado."); }
          
          const extractedData = JSON.parse(jsonString);
          if (type === 'client') {
            setFormData(prev => ({ ...prev, ...extractedData, legalRepresentative: prev.legalRepresentative }));
          } else {
            setFormData(prev => ({ ...prev, legalRepresentative: { ...prev.legalRepresentative, ...extractedData } }));
          }
        } catch (e: any) {
          setError(e.message || 'Falha ao analisar o documento.');
        } finally {
          setIsAnalyzing(null);
        }
      };
      reader.onerror = () => setError("Erro ao ler o arquivo.");
      if (fileToProcess.type.startsWith('image/')) reader.readAsDataURL(fileToProcess);
      else if (fileToProcess.type === 'application/pdf') reader.readAsArrayBuffer(fileToProcess);
    } catch (e: any) {
      setError(e.message);
      setIsAnalyzing(null);
    }
  };
  
  useEffect(() => { if (file) processFileWithAI(file, 'client'); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [file]);
  useEffect(() => { if (repFile) processFileWithAI(repFile, 'rep'); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [repFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'client' | 'rep') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'client') setFile(e.target.files[0]);
      else setRepFile(e.target.files[0]);
    }
  };

  const handleCepChange = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep }));
    if (cep.length !== 8) return;
    setIsCepLoading(true);
    setError('');
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('CEP não encontrado.');
        const data = await response.json();
        if (data.erro) throw new Error('CEP inválido ou não encontrado.');
        setFormData(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, complement: data.complemento || prev.complement }));
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsCepLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) onSave({ ...initialData, ...formData });
    else onSave(formData as Omit<Client, 'id' | 'createdAt'>);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, isRep = false) => {
    const { name, value } = e.target;
    if (isRep) {
        setFormData(prev => ({ ...prev, legalRepresentative: { ...prev.legalRepresentative!, [name]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  const renderPersonFields = (personData: any, isRep: boolean) => (
    <>
        <div className="md:col-span-2"><label htmlFor={`${isRep ? 'rep_': ''}name`} className="block text-sm font-medium text-slate-700">Nome Completo</label><input type="text" name="name" id={`${isRep ? 'rep_': ''}name`} value={personData.name} onChange={(e) => handleFormChange(e, isRep)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}motherName`} className="block text-sm font-medium text-slate-700">Nome da Mãe</label><input type="text" name="motherName" id={`${isRep ? 'rep_': ''}motherName`} value={personData.motherName} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}fatherName`} className="block text-sm font-medium text-slate-700">Nome do Pai</label><input type="text" name="fatherName" id={`${isRep ? 'rep_': ''}fatherName`} value={personData.fatherName} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}dateOfBirth`} className="block text-sm font-medium text-slate-700">Data de Nascimento</label><input type="date" name="dateOfBirth" id={`${isRep ? 'rep_': ''}dateOfBirth`} value={personData.dateOfBirth} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}cpf`} className="block text-sm font-medium text-slate-700">CPF</label><input type="text" name="cpf" id={`${isRep ? 'rep_': ''}cpf`} value={personData.cpf} onChange={(e) => handleFormChange(e, isRep)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}nacionalidade`} className="block text-sm font-medium text-slate-700">Nacionalidade</label><input type="text" name="nacionalidade" id={`${isRep ? 'rep_': ''}nacionalidade`} value={personData.nacionalidade} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}naturalidade`} className="block text-sm font-medium text-slate-700">Naturalidade</label><input type="text" name="naturalidade" id={`${isRep ? 'rep_': ''}naturalidade`} value={personData.naturalidade} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div className="md:col-span-2"><label htmlFor={`${isRep ? 'rep_': ''}profissao`} className="block text-sm font-medium text-slate-700">Profissão</label><input type="text" name="profissao" id={`${isRep ? 'rep_': ''}profissao`} value={personData.profissao} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}estadoCivil`} className="block text-sm font-medium text-slate-700">Estado Civil</label><select name="estadoCivil" id={`${isRep ? 'rep_': ''}estadoCivil`} value={personData.estadoCivil} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm"><option value="">Selecione...</option><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option></select></div>
        <div className="md:col-span-2"><label htmlFor={`${isRep ? 'rep_': ''}rg`} className="block text-sm font-medium text-slate-700">RG / Nº da Certidão</label><input type="text" name="rg" id={`${isRep ? 'rep_': ''}rg`} value={personData.rg} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        <div className="col-span-2 grid grid-cols-3 gap-2">
            <div className="col-span-2"><label htmlFor={`${isRep ? 'rep_': ''}rgIssuer`} className="block text-sm font-medium text-slate-700">Órgão Emissor</label><input type="text" name="rgIssuer" id={`${isRep ? 'rep_': ''}rgIssuer`} value={personData.rgIssuer} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
            <div><label htmlFor={`${isRep ? 'rep_': ''}rgIssuerUF`} className="block text-sm font-medium text-slate-700">UF</label><input type="text" name="rgIssuerUF" id={`${isRep ? 'rep_': ''}rgIssuerUF`} value={personData.rgIssuerUF} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
        </div>
        <div><label htmlFor={`${isRep ? 'rep_': ''}dataEmissao`} className="block text-sm font-medium text-slate-700">Data de Emissão</label><input type="date" name="dataEmissao" id={`${isRep ? 'rep_': ''}dataEmissao`} value={personData.dataEmissao} onChange={(e) => handleFormChange(e, isRep)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} className="text-slate-600" /></button></div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-8">
                <fieldset><legend className="text-lg font-medium text-slate-900">Contato e Análise IA</legend>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label><input type="email" name="email" id="email" value={formData.email} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
                        <div><label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefone</label><input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Documento do Cliente</label>
                            <p className="text-sm text-slate-500 mb-2">Envie um documento para preencher os campos abaixo automaticamente.</p>
                            <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-blue-500">
                                <div className="space-y-1 text-center">
                                    {isAnalyzing === 'client' ? <Loader2 className="mx-auto h-12 w-12 text-slate-400 animate-spin" /> : file ? (file.type.startsWith('image/') ? <ImageIcon className="mx-auto h-12 w-12 text-slate-400" /> : <FileText className="mx-auto h-12 w-12 text-slate-400" />) : (<UploadCloud className="mx-auto h-12 w-12 text-slate-400" />)}
                                    <div className="flex text-sm text-slate-600"><span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"><span>{file ? 'Trocar arquivo' : 'Enviar um arquivo'}</span><input ref={fileInputRef} type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'client')} accept="image/png, image/jpeg, image/jpg, application/pdf" /></span><p className="pl-1">{file ? file.name : 'ou arraste e solte'}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset><legend className="text-lg font-medium text-slate-900">Dados do Cliente (Autor)</legend>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{renderPersonFields(formData, false)}</div>
                </fieldset>

                {isUnderage && (
                    <fieldset className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg"><legend className="text-lg font-medium text-yellow-800 flex items-center"><AlertTriangle className="mr-2"/>Representante Legal</legend>
                        <p className="text-sm text-yellow-700 mb-3">Cliente menor de idade. Envie o documento do representante para preencher os dados.</p>
                        <div onClick={() => repFileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-yellow-300 border-dashed rounded-md cursor-pointer bg-yellow-50 hover:border-yellow-500">
                            <div className="space-y-1 text-center">
                                {isAnalyzing === 'rep' ? <Loader2 className="mx-auto h-10 w-10 text-yellow-600 animate-spin" /> : repFile ? <ImageIcon className="mx-auto h-10 w-10 text-yellow-600" /> : <UploadCloud className="mx-auto h-10 w-10 text-yellow-600" />}
                                <div className="flex text-sm text-yellow-800"><span className="relative bg-yellow-50 rounded-md font-medium text-indigo-600 hover:text-indigo-500"><span>{repFile ? 'Trocar doc.' : 'Enviar doc. do representante'}</span><input ref={repFileInputRef} type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'rep')} accept="image/png, image/jpeg, image/jpg, application/pdf" /></span><p className="pl-1">{repFile ? repFile.name : ''}</p></div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{renderPersonFields(formData.legalRepresentative, true)}</div>
                    </fieldset>
                )}

                <fieldset><legend className="text-lg font-medium text-slate-900">Endereço</legend>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative md:col-span-2"><label htmlFor="cep" className="block text-sm font-medium text-slate-700">CEP</label><input type="text" name="cep" id="cep" value={formData.cep} onChange={(e) => handleCepChange(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" maxLength={9} /><div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3">{isCepLoading && <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}</div></div>
                        <div className="md:col-span-2"><label htmlFor="street" className="block text-sm font-medium text-slate-700">Rua / Logradouro</label><input type="text" name="street" id="street" value={formData.street} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-slate-50" readOnly={isCepLoading} /></div>
                        <div><label htmlFor="number" className="block text-sm font-medium text-slate-700">Número</label><input type="text" name="number" id="number" value={formData.number} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
                        <div><label htmlFor="complement" className="block text-sm font-medium text-slate-700">Complemento</label><input type="text" name="complement" id="complement" value={formData.complement} onChange={handleFormChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" /></div>
                        <div><label htmlFor="neighborhood" className="block text-sm font-medium text-slate-700">Bairro</label><input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-slate-50" readOnly={isCepLoading} /></div>
                        <div><label htmlFor="city" className="block text-sm font-medium text-slate-700">Cidade</label><input type="text" name="city" id="city" value={formData.city} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-slate-50" readOnly={isCepLoading} /></div>
                        <div><label htmlFor="state" className="block text-sm font-medium text-slate-700">Estado (UF)</label><input type="text" name="state" id="state" value={formData.state} onChange={handleFormChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-slate-50" readOnly={isCepLoading} /></div>
                    </div>
                </fieldset>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Salvar</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientFormModal;
