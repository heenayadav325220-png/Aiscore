import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-rose-500 to-cyan-500 animate-pulse" />
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black font-display text-white tracking-tight">
                CORE AI Interface Recovery
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                An unforeseen temporary glitch occurred in the display renderer. Click below to reload cleanly.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
            >
              <RotateCw className="w-4 h-4 text-slate-950" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
