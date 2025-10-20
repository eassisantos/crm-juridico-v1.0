
import React, { useRef, useState } from 'react';
import { Case, BenefitType } from '../types';
import { CheckCircle, XCircle, Upload } from 'lucide-react';
import { useCrmData } from '../hooks/useCrmData';
import { useToast } from '../contexts/ToastContext';

interface DocumentChecklistProps {
  caseData: Case;
}

const requiredDocsByBenefit: Record<BenefitType, string[]> = {
    [BenefitType.APOSENTADORIA_IDADE]: ["Documento de Identificação (RG/CNH)", "CPF", "Comprovante de Residência", "Carteira de Trabalho (CTPS)", "Extrato CNIS"],
    [BenefitType.APOSENTADORIA_CONTRIBUICAO]: ["Documento de Identificação (RG/CNH)", "CPF", "Comprovante de Residência", "Carteira de Trabalho (CTPS)", "Extrato CNIS", "Carnês de contribuição (GPS)"],
    [BenefitType.APOSENTADORIA_ESPECIAL]: ["Documento de Identificação (RG/CNH)", "CPF", "Carteira de Trabalho (CTPS)", "Perfil Profissiográfico Previdenciário (PPP)", "LTCAT"],
    [BenefitType.APOSENTADORIA_INVALIDEZ]: ["Documento de Identificação (RG/CNH)", "CPF", "Comprovante de Residência", "Laudos e Exames Médicos", "Carteira de Trabalho (CTPS)"],
    [BenefitType.AUXILIO_DOENCA]: ["Documento de Identificação (RG/CNH)", "CPF", "Comprovante de Residência", "Laudos e Exames Médicos", "Atestado Médico com CID"],
    [BenefitType.AUXILIO_ACIDENTE]: ["Documento de Identificação (RG/CNH)", "CPF", "Comunicação de Acidente de Trabalho (CAT)", "Laudos e Exames Médicos"],
    [BenefitType.BPC_LOAS]: ["Documento de Identificação (RG/CNH) de todos do grupo familiar", "CPF de todos do grupo familiar", "Comprovante de Residência", "Cadastro Único (CadÚnico) atualizado"],
    [BenefitType.PENSAO_MORTE]: ["Documento de Identificação (RG/CNH) do requerente", "CPF do requerente", "Certidão de Óbito", "Documentos do falecido", "Certidão de Casamento/Nascimento"],
    [BenefitType.SALARIO_MATERNIDADE]: ["Documento de Identificação (RG/CNH)", "CPF", "Certidão de Nascimento da criança", "Carteira de Trabalho (CTPS)"],
};

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ caseData }) => {
  const { addDocumentToCase } = useCrmData();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);

  const uploadedDocNames = caseData.documents.map(doc => doc.name.toLowerCase());

  const isDocUploaded = (docName: string) => {
    const simplifiedName = docName.toLowerCase().split('(')[0].trim();
    return uploadedDocNames.some(uploaded => uploaded.includes(simplifiedName));
  };

  const handleUploadClick = (docName: string) => {
    setUploadingDocName(docName);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadingDocName) {
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${uploadingDocName}.${fileExtension}`;
      addDocumentToCase(caseData.id, { name: newFileName, url: '#' });
      addToast(`Documento "${newFileName}" adicionado com sucesso!`, 'success');
    }
    if(event.target) event.target.value = '';
    setUploadingDocName(null);
  };

  return (
    <div className="space-y-3">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <h3 className="text-sm font-semibold text-slate-600">Documentos Sugeridos para {caseData.benefitType}:</h3>
      <ul className="space-y-2">
        {requiredDocsByBenefit[caseData.benefitType].map(docName => {
          const uploaded = isDocUploaded(docName);
          return (
            <li key={docName} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-slate-50">
              <div className="flex items-center">
                {uploaded ? (
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
                )}
                <span className={uploaded ? 'text-slate-500 line-through' : 'text-slate-800'}>
                  {docName}
                </span>
              </div>
              {!uploaded && (
                <button onClick={() => handleUploadClick(docName)} className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200">
                    <Upload size={12} className="mr-1" />
                    Enviar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentChecklist;
