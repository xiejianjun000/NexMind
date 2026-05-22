// NexMind 主应用
// 精致的NexMind智能助手界面 + 错误边界保护

import ErrorBoundary from './components/Common/ErrorBoundary';
import NexMindHome from './pages/NexMindHome';

function App() {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        // 生产环境应该发送到错误监控服务（如Sentry）
        console.error('Page-level error:', { error, errorInfo });
      }}
    >
      <NexMindHome />
    </ErrorBoundary>
  );
}

export default App;
