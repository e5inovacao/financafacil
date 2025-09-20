export const formatCurrency = (value: number | undefined | null): string => {
  // Se o valor for undefined, null ou NaN, retorna R$ 0,00
  if (value == null || isNaN(value)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(0)
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  if (!digits) return ''
  
  // Converte para número (centavos)
  const number = parseInt(digits) / 100
  
  // Formata como moeda
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number)
}

export const parseCurrencyInput = (value: string): number => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  if (!digits) return 0
  
  // Converte para número (centavos para reais)
  return parseInt(digits) / 100
}