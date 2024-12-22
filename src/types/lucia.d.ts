import { initializeLuciaUser } from '~/utils'

declare global {
  type LuciaUserType = ReturnType<typeof initializeLuciaUser>
}
