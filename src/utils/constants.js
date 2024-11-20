
export const WHITELIST_DOMAINS = [
    'http://localhost:5173' //Không cần localhost nữa vì ở file config/cors đã luôn cho phép môi trường dev (env.BUILD_MODE === 'dev)
    // 'https://trello-web-blue-delta.vercel.app'
]

export const BOARD_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
} 