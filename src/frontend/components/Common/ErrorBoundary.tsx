// ErrorBoundary - React组件错误边界
// 捕获子组件错误，显示友好错误界面，提供重试功能

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 记录错误到控制台（生产环境应该发送到错误监控服务）
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails, errorId } = this.state;
    const { children, fallback, level = 'section' } = this.props;

    if (hasError) {
      // 如果有自定义fallback，使用它
      if (fallback) {
        return fallback;
      }

      // 根据级别渲染不同的错误界面
      return (
        <ErrorFallback
          level={level}
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          showDetails={showDetails}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return children;
  }
}

// 错误界面组件
interface ErrorFallbackProps {
  level: 'page' | 'section' | 'component';
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  onReset: () => void;
  onReload: () => void;
  onToggleDetails: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  level,
  error,
  errorInfo,
  errorId,
  showDetails,
  onReset,
  onReload,
  onToggleDetails,
}) => {
  const levelStyles = {
    page: 'min-h-screen flex items-center justify-center p-8',
    section: 'p-6 rounded-xl',
    component: 'p-4 rounded-lg',
  };

  const containerStyles = {
    page: 'max-w-2xl w-full',
    section: 'bg-slate-800/50 border border-slate-700',
    component: 'bg-red-900/20 border border-red-800/30',
  };

  if (level === 'component') {
    return (
      <div className={levelStyles.component}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">组件加载失败</span>
        </div>
        <button
          onClick={onReset}
          className="mt-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          点击重试
        </button>
      </div>
    );
  }

  return (
    <div className={`${levelStyles.page} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={containerStyles[level]}
      >
        {/* 错误图标 */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.3)',
            }}
          >
            <Bug className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* 错误标题 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {level === 'page' ? '页面加载失败' : '区块加载失败'}
          </h2>
          <p className="text-slate-400 text-sm">
            抱歉，发生了意外错误。请尝试刷新页面或联系支持团队。
          </p>
        </motion.div>

        {/* 错误ID */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 rounded-lg px-4 py-3 mb-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">错误追踪ID</span>
            <code className="text-xs font-mono text-red-400">{errorId}</code>
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center mb-6"
        >
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重试</span>
          </button>
          
          <button
            onClick={onReload}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>刷新页面</span>
          </button>
        </motion.div>

        {/* 错误详情折叠面板 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onToggleDetails}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors"
          >
            <span className="text-sm text-slate-400">技术详情</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                showDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {/* 错误消息 */}
                  {error && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        错误信息
                      </h4>
                      <pre className="bg-slate-900 rounded-lg p-4 text-sm text-red-300 font-mono overflow-x-auto">
                        {error.message}
                      </pre>
                    </div>
                  )}

                  {/* 错误堆栈 */}
                  {error?.stack && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        错误堆栈
                      </h4>
                      <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-400 font-mono overflow-x-auto max-h-48">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* 组件堆栈 */}
                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        组件堆栈
                      </h4>
                      <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-400 font-mono overflow-x-auto max-h-48">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 小黄人安慰动画 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex justify-center"
        >
          <div className="relative">
            {/* 小黄人安慰表情 */}
            <div className="text-6xl">🤖</div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"
            >
              💪
            </motion.div>
          </div>
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-4">
          别担心，小黄人会继续努力工作的！
        </p>
      </motion.div>
    </div>
  );
};

// 高阶组件包装器
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook版本的错误边界
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Caught error by hook:', error);
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

export default ErrorBoundary;
