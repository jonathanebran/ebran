import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

/**
 * Captura qualquer erro de renderização em qualquer tela e mostra uma tela de
 * recuperação em vez de deixar o app inteiro cair para uma tela branca.
 * NÃO apaga os dados do usuário — o "Limpar cache" só remove o service worker
 * e os caches do app (a "casca"), preservando o localStorage.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Erro inesperado' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Deixa rastro no console para depuração; não vaza dados do usuário.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reload = () => window.location.reload();

  private hardReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {
      /* segue para o reload de qualquer forma */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
        style={{ background: '#000', maxWidth: 430, margin: '0 auto' }}
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(255,47,125,0.12)', border: '1px solid rgba(255,47,125,0.3)' }}
        >
          <span style={{ fontSize: 28 }}>⚠️</span>
        </div>
        <h1 className="text-[#F7F7F7] font-bold text-lg mb-2">Algo deu errado</h1>
        <p className="text-[#A8A8A8] text-sm mb-1">O app encontrou um erro e parou esta tela.</p>
        <p className="text-[#6F6F6F] text-xs mb-8">Seus dados continuam salvos. Tente recarregar.</p>

        <button
          onClick={this.reload}
          className="w-full max-w-xs py-3 rounded-2xl font-semibold text-sm mb-3"
          style={{ background: 'linear-gradient(135deg, #FFD84A, #FF9F3D 40%, #FF6B5F 70%, #FF2F7D)', color: '#000' }}
        >
          Recarregar
        </button>
        <button
          onClick={this.hardReset}
          className="w-full max-w-xs py-3 rounded-2xl font-medium text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#A8A8A8', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Limpar cache e recarregar
        </button>

        {this.state.message && (
          <p className="text-[#3F3F3F] text-[10px] mt-6 break-words max-w-xs">{this.state.message}</p>
        )}
      </div>
    );
  }
}
