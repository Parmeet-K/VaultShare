export function simulateFileIntelligence(file) {
  const extension = file.originalname.split('.').pop()?.toLowerCase() || 'file';
  return {
    summary: `AI summary queued for ${file.originalname}. This placeholder is ready for OpenAI, OCR, or document parsing integration.`,
    tags: [...new Set([extension, file.mimetype.split('/')[0], 'encrypted'])],
    ocrText: file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' ? 'OCR extraction queued.' : ''
  };
}
