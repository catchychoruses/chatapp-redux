import './App.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Chat } from '@/views/chat';
import { Auth } from '@/views/auth';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeContextProvider } from './context/theme';
import { ChatList } from './views/chat/ChatList';
import { SocketContextProvider } from './context/socket';

const BrowserWrapper = () => (
  <SocketContextProvider>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Chat />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/chat-list" element={<ChatList />} />
      </Routes>
    </BrowserRouter>
  </SocketContextProvider>
);

export const AppWrapper = () => (
  <Provider store={store}>
    <BrowserWrapper />
  </Provider>
);

function App() {
  return (
    <ThemeContextProvider>
      <AppWrapper />
    </ThemeContextProvider>
  );
}

export default App;
