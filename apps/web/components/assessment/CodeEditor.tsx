'use client';

import { Editor } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language: string;
    readOnly?: boolean;
}

export function CodeEditor({ code, onChange, language, readOnly = false }: CodeEditorProps) {
    // Map language names to Monaco language IDs
    const getMonacoLanguage = (lang: string): string => {
        const languageMap: Record<string, string> = {
            javascript: 'javascript',
            python: 'python',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            csharp: 'csharp',
        };
        return languageMap[lang.toLowerCase()] || 'javascript';
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={code}
                onChange={onChange}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                }}
                loading={
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }
            />
        </div>
    );
}
