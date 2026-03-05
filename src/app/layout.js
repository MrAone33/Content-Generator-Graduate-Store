import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
    title: 'Graduate Store — Content Generator',
    description: 'Outil de génération de contenu pour Graduate Store',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>{children}</body>
        </html>
    )
}
