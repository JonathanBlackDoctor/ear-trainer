import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-canvas-50 flex items-center justify-center p-5">
        <div className="card-hero max-w-md w-full text-center">
          <div className="text-5xl mb-3" aria-hidden>⚠️</div>
          <h1 className="font-display text-xl font-bold text-primary-900 mb-2">
            문제가 발생했습니다
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            예기치 못한 오류로 화면을 표시할 수 없어요. 다시 시도하거나 홈으로 이동하세요.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-left text-xs bg-canvas-100 border border-canvas-200 rounded-lg p-3 mb-4 overflow-auto max-h-32 text-slate-600">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex flex-col gap-2">
            <button className="btn-primary w-full" onClick={this.handleReset}>
              다시 시도
            </button>
            <button className="btn-secondary w-full" onClick={this.handleReload}>
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }
}
