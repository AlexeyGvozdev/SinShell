import { Request, Response } from 'express';
import { AboutInfo, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Получение информации о проекте
 */
export const getAbout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  const aboutInfo: AboutInfo = {
    title: 'SinShell',
    description: 'Terminal styled website built with Next.js and Express',
    author: 'Alexey Gvozdev',
    version: process.env.npm_package_version || '1.0.0',
    links: [
      {
        name: 'GitHub',
        url: 'https://github.com/AlexeyGvozdev/SinShell',
        icon: 'github',
      },
      {
        name: 'Portfolio',
        url: 'https://alexeygvozdev.github.io',
        icon: 'globe',
      },
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/alexeygvozdev',
        icon: 'linkedin',
      },
    ],
    technologies: [
      'Next.js 14+',
      'TypeScript',
      'Express.js',
      'Tailwind CSS',
      'React',
      'Node.js',
    ],
  };

  const response: ApiResponse<AboutInfo> = {
    success: true,
    data: aboutInfo,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Получение расширенной информации о проекте
 */
export const getExtendedAbout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  const extendedAbout = {
    title: 'SinShell',
    description: 'Terminal styled website built with Next.js and Express',
    author: 'Alexey Gvozdev',
    version: process.env.npm_package_version || '1.0.0',
    license: 'MIT',
    repository: 'https://github.com/AlexeyGvozdev/SinShell',
    homepage: 'https://sinshell.alexeygvozdev.com',
    links: [
      {
        name: 'GitHub',
        url: 'https://github.com/AlexeyGvozdev/SinShell',
        icon: 'github',
        description: 'Исходный код проекта',
      },
      {
        name: 'Portfolio',
        url: 'https://alexeygvozdev.github.io',
        icon: 'globe',
        description: 'Портфолио разработчика',
      },
    ],
    technologies: {
      frontend: [
        'Next.js 14+',
        'TypeScript',
        'React',
        'Tailwind CSS',
        'React Context API',
      ],
      backend: [
        'Express.js',
        'TypeScript',
        'Node.js 18+',
        'Morgan',
        'CORS',
        'Helmet',
      ],
      devops: [
        'Git',
        'GitHub Actions',
        'Vercel',
        'Railway',
      ],
    },
    features: [
      '🖥️ Terminal-style interface',
      '⚡ Next.js 13+ with TypeScript',
      '🎨 Tailwind CSS for styling',
      '🔧 Express.js backend with TypeScript',
      '📱 Responsive design',
      '🎯 Customizable commands',
      '🌙 Multiple themes support',
      '🔐 User authentication (future)',
      '📊 Command history (future)',
      '🔌 Plugin system (future)',
    ],
    architecture: {
      type: 'Monorepo with npm workspaces',
      frontend: 'Next.js App Router',
      backend: 'Express.js REST API',
      database: 'PostgreSQL (planned)',
      cache: 'Redis (planned)',
    },
    timestamp,
  };

  const response: ApiResponse = {
    success: true,
    data: extendedAbout,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Получение информации о лицензии
 */
export const getLicense = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  const licenseInfo = {
    name: 'MIT License',
    type: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
    description: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
    conditions: [
      'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
    ],
    limitations: [
      'The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.',
      'In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.',
    ],
    year: new Date().getFullYear(),
    holder: 'Alexey Gvozdev',
    timestamp,
  };

  const response: ApiResponse = {
    success: true,
    data: licenseInfo,
    timestamp,
  };

  res.status(200).json(response);
});