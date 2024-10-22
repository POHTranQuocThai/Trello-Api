/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

export const WHITELIST_DOMAINS = [
    // 'http://localhost:5173' //Không cần localhost nữa vì ở file config/cors đã luôn cho phép môi trường dev (env.BUILD_MODE === 'dev)
    'https://trello-5bn5lsue9-pohs-projects-4dc4ae92.vercel.app'
]

export const BOARD_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
}