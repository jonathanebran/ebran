import React from 'react';

interface Props { children: React.ReactNode }
interface State { error: Error | null }

// Captura erros de renderização em qualquer tela. Sem isso, um erro de React
// desmonta a árvore inteira e o usuário vê apenas uma tela preta vazia.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    try {
      const log = JSON.parse(localStorage.getItem('ebran:errors:v1') ?? '[]');
      log.unshift({
        at: new Date().toISOString(),
        message: error.message,
        stack: String(error.stack ?? '').slice(0, 1500),
        path: window.location.pathname,
      });
      localStorage.setItem('ebran:errors:v1', JSON.stringify(log.slice(0, 20)));
    } catch { /* armazenamento cheio ou indisponível */ }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-8 gap-4"
        style={{ background: '#000' }}
      >
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p className="text-[#F7F7F7] font-bold text-lg text-center">Algo deu errado</p>
        <p className="text-[#6F6F6F] text-sm text-center">
          A tela travou, mas seus dados estão salvos. Toque abaixo para recarregar.
        </p>
        <p
          className="text-[#3F3F3F] text-[10px] text-center font-mono px-4 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', wordBreak: 'break-word' }}
        >
          {error.message}
        </p>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="mt-2 px-6 py-3 rounded-2xl font-semibold text-sm"
          style={{
            background: 'linear-gradient(135deg, var(--color-start), var(--color-end))',
            color: 'var(--color-on-gradient)',
          }}
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}
