import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'SkillCoach AI - Soft Skills Training',
  description: 'AI-powered soft skills coaching platform. Improve your clarity, confidence, and professional communication.',
  keywords: 'soft skills, AI coach, communication, professional development, interview preparation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <Navigation />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
