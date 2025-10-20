
import { GoogleGenAI, Type } from '@google/genai';
import { Case } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

const callGeminiWithRetry = async (request: any) => {
    if (!API_KEY) {
        throw new Error("A chave da API do Google não está configurada.");
    }
    try {
        const response = await ai.models.generateContent(request);
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Falha na comunicação com a IA. Verifique a configuração da API e tente novamente.");
    }
};

export const generateCaseSummary = async (caseData: Case, clientName: string): Promise<string> => {
  const prompt = `
    Aja como um assistente jurídico especialista em direito previdenciário.
    Analise os dados do caso a seguir e gere um resumo claro e conciso em português.
    O resumo deve ser formatado em markdown e incluir:
    1.  **Identificação do Caso**: Cliente e tipo de benefício.
    2.  **Status Atual**: Qual a situação presente do caso.
    3.  **Histórico Relevante**: Um breve resumo das notas e dos acontecimentos.
    4.  **Próximos Passos Sugeridos**: Com base no status e nas notas, o que deve ser feito a seguir.

    **Dados do Caso:**
    - **Cliente:** ${clientName}
    - **Número do Processo:** ${caseData.caseNumber}
    - **Tipo de Benefício:** ${caseData.benefitType}
    - **Status Atual:** ${caseData.status}
    - **Data de Início:** ${new Date(caseData.startDate).toLocaleDateString('pt-BR')}
    - **Notas:** ${caseData.notes}
  `;
  return callGeminiWithRetry({
    model: 'gemini-2.5-flash',
    contents: { role: 'user', parts: [{ text: prompt }] },
    config: { temperature: 0.5 }
  });
};

export const analyzeDocumentText = async (documentText: string): Promise<string> => {
    const prompt = `
    Aja como um assistente jurídico altamente qualificado. Analise o texto do documento fornecido e retorne uma análise estruturada em markdown.
    A análise deve conter as seguintes seções:

    ### 📝 Resumo do Documento
    Um resumo conciso do propósito e conteúdo principal do documento.

    ### 🔑 Informações Chave Extraídas
    Liste as entidades e informações mais importantes encontradas, como:
    - **Nomes:** (Liste os nomes de pessoas ou instituições)
    - **Datas:** (Liste as datas relevantes)
    - **Valores:** (Liste quaisquer valores monetários ou numéricos importantes)
    - **Locais:** (Liste cidades, estados ou endereços mencionados)

    ### 📄 Classificação Sugerida
    Sugira um tipo para este documento (ex: Laudo Médico, Petição Inicial, Comprovante de Residência, Contrato, Notificação Extrajudicial, etc.).

    ---
    **TEXTO PARA ANÁLISE:**
    """
    ${documentText}
    """
    `;
    return callGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: { temperature: 0.3 }
    });
};

const clientInfoSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nome completo da pessoa." },
        motherName: { type: Type.STRING, description: "Nome da mãe (filiação)." },
        fatherName: { type: Type.STRING, description: "Nome do pai (filiação)." },
        cpf: { type: Type.STRING, description: "Número do CPF, formatado ou não." },
        rg: { type: Type.STRING, description: "Número do RG ou da Matrícula da Certidão de Nascimento." },
        rgIssuer: { type: Type.STRING, description: "Órgão emissor do documento de identidade (ex: SSP, DETRAN)." },
        rgIssuerUF: { type: Type.STRING, description: "UF do órgão emissor (ex: SP, RJ)." },
        dataEmissao: { type: Type.STRING, description: "Data de emissão do documento no formato AAAA-MM-DD." },
        dateOfBirth: { type: Type.STRING, description: "Data de nascimento no formato AAAA-MM-DD." },
        nacionalidade: { type: Type.STRING, description: "Nacionalidade (ex: Brasileiro, Portuguesa)."},
        naturalidade: { type: Type.STRING, description: "Cidade e estado de nascimento (ex: São Paulo/SP)." },
        estadoCivil: { type: Type.STRING, description: "Estado civil (Solteiro(a), Casado(a), etc.)." },
        profissao: { type: Type.STRING, description: "Profissão da pessoa." },
        email: { type: Type.STRING, description: "Endereço de e-mail." },
        phone: { type: Type.STRING, description: "Número de telefone." },
        cep: { type: Type.STRING, description: "CEP (Código de Endereçamento Postal)." },
        street: { type: Type.STRING, description: "Nome da rua/logradouro." },
        number: { type: Type.STRING, description: "Número do imóvel." },
        complement: { type: Type.STRING, description: "Complemento do endereço (apto, bloco, etc.)." },
        neighborhood: { type: Type.STRING, description: "Bairro." },
        city: { type: Type.STRING, description: "Cidade." },
        state: { type: Type.STRING, description: "Sigla do estado (UF)." },
    },
};

const clientInfoExtractionPrompt = `
    Analise o texto ou a imagem a seguir, que pode ser um documento de identificação (RG, CNH), Certidão de Nascimento, Certidão de Casamento, comprovante de endereço ou cadastro.
    Extraia as informações da pessoa e retorne-as estritamente como um objeto JSON.
    Para Certidões de Nascimento, o campo 'rg' deve ser preenchido com o número da Matrícula.
    Se for um RG, extraia o número, órgão emissor (rgIssuer) e UF do órgão emissor (rgIssuerUF).
    Os campos a serem extraídos são: name, motherName, fatherName, cpf, rg, rgIssuer, rgIssuerUF, dataEmissao (formato AAAA-MM-DD), dateOfBirth (formato AAAA-MM-DD), nacionalidade, naturalidade, estadoCivil, profissao, email, phone, e o endereço completo separado em: cep, street, number, complement, neighborhood, city, state.
    Se uma informação não for encontrada, retorne uma string vazia para o campo correspondente.
`;

export const extractClientInfoFromDocument = async (documentText: string): Promise<string> => {
    const prompt = `${clientInfoExtractionPrompt}\n\nTexto do documento:\n"""\n${documentText}\n"""`;
    return callGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: clientInfoSchema,
        },
    });
};

export const extractClientInfoFromImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
    const imagePart = { inlineData: { data: base64ImageData, mimeType: mimeType } };
    const textPart = { text: clientInfoExtractionPrompt };

    return callGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: clientInfoSchema,
        },
    });
};

export const suggestTasksFromNotes = async (notes: string): Promise<string> => {
    const prompt = `
    Aja como um paralegal sênior especialista em direito previdenciário. Analise as notas a seguir e identifique ações concretas que precisam ser tomadas.
    Retorne uma lista de tarefas sugeridas em formato JSON. Cada tarefa deve ter uma 'description' clara e acionável, um 'dueDate' (data de vencimento) em formato AAAA-MM-DD se um prazo for mencionado, e um 'reasoning' (justificativa) explicando por que a tarefa é necessária.
    Se nenhum prazo for mencionado, não inclua o campo 'dueDate'.
    Se nenhuma tarefa for identificada, retorne uma lista vazia.

    Exemplo de nota: "Cliente informou que o INSS emitiu uma carta de exigência para apresentar laudo médico atualizado em 30 dias."
    Exemplo de saída:
    [
        {
            "description": "Contatar cliente para solicitar novo laudo médico",
            "reasoning": "O INSS emitiu uma exigência que precisa ser cumprida."
        },
        {
            "description": "Protocolar laudo médico no Meu INSS",
            "dueDate": "${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
            "reasoning": "Cumprir o prazo de 30 dias da exigência do INSS."
        }
    ]

    Notas para análise:
    """
    ${notes}
    """
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                dueDate: { type: Type.STRING, nullable: true },
                reasoning: { type: Type.STRING },
            },
            required: ['description', 'reasoning'],
        }
    };

    return callGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });
};
