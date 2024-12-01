import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
    //'http://localhost:5173' //Không cần localhost nữa vì ở file config/cors đã luôn cho phép môi trường dev (env.BUILD_MODE === 'dev)
    'https://trello-web-blue-delta.vercel.app'
]

export const BOARD_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
}
export const WEBSITE_DOAMIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
    BOARD_INVITATION: 'BOARD_INVITATION'
}
export const BOARD_INVITATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED'
}