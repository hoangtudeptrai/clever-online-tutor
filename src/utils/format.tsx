import { format, parseISO } from 'date-fns'

export const formatDate = (dateStr?: string | null, formatStr = 'dd/MM/yyyy HH:mm:ss') => {
  if (!dateStr) return '';

  try {
    return format(parseISO(dateStr), formatStr)
  } catch (error) {
    console.error('Invalid date:', dateStr)
    return ''
  }
}

export const formatBirthday = (dateStr?: string | null, formatStr = 'dd/MM/yyyy') => {
  if (!dateStr) return '';

  try {
    return format(parseISO(dateStr), formatStr)
  } catch (error) {
    console.error('Invalid date:', dateStr)
    return ''
  }
}