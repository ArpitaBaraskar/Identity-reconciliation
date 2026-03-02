export interface Contact {
   id: number
   email?: string
   phoneNumber?: string
   linkedId?: number | null
   linkPrecedence: 'primary' | 'secondary'
}