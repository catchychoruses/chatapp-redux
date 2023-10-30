import { useContext, useEffect, useState } from 'react';
import styles from './Auth.module.scss';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  selectAuthErrorState,
  selectAuthLoadingState,
  selectUserData
} from '@/store/slices';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/reduxHelpers';
import { registerAPI, loginAPI } from '@/store/slices/auth/authActions';
import { Button } from '@/shared/components/Button';
import { ThemeContext } from '@/context/theme/themeContext';
import clsx from 'clsx';

const schema = z.object({
  email: z.string().min(1, { message: 'Login is required' }),
  password: z.string().min(1, 'Password is required'),
  username: z.string().max(20)
});

export const Auth = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUserData);
  const loading = useAppSelector(selectAuthLoadingState);
  const error = useAppSelector(selectAuthErrorState);

  const { theme } = useContext(ThemeContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.authenticated) {
      navigate('/');
    }
  }, [navigate, user]);

  const [registerView, setRegisterView] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      username: ''
    }
  });

  const handleRegister = async () => {
    dispatch(registerAPI(form.getValues()));
  };

  const handleLogin = async () => {
    dispatch(loginAPI(form.getValues()));
  };

  return (
    <main className={clsx(styles['main-auth'], styles[`${theme}-theme`])}>
      <div className={clsx(styles['auth-container'], styles[`${theme}-theme`])}>
        {registerView ? (
          <>
            <form
              className={styles['login-form']}
              onSubmit={form.handleSubmit(handleRegister)}
            >
              <h1>Register</h1>
              <div className={styles.inputs}>
                <div className={styles['input-wrapper']}>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    {...form.register('email', { required: true })}
                    data-testID="auth-email-field"
                  />
                </div>
                <div className={styles['input-wrapper']}>
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    {...form.register('username', { required: true })}
                    data-testID="auth-username-field"
                  />
                </div>

                <div className={styles['input-wrapper']}>
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    {...form.register('password', { required: true })}
                    data-testID="auth-password-field"
                  />
                </div>
              </div>
              <Button display="Register" type="submit" />
            </form>
            <a onClick={() => setRegisterView(false)}>Login</a>
          </>
        ) : (
          <>
            <form
              className={styles['login-form']}
              onSubmit={form.handleSubmit(handleLogin)}
            >
              <h1>Login</h1>
              <div className={styles.inputs}>
                <div className={styles['input-wrapper']}>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    {...form.register('email', { required: true })}
                    data-testID="auth-email-field"
                  />
                </div>
                <div>
                  <div className={styles['input-wrapper']}>
                    <label htmlFor="password">Password:</label>
                    <input
                      type="password"
                      {...form.register('password', { required: true })}
                      data-testID="auth-password-field"
                    />
                  </div>
                </div>
                <div className={styles.status}>
                  {error ? (
                    <p>Error: {error} </p>
                  ) : (
                    loading && <p>Loading...</p>
                  )}
                </div>
              </div>
              <Button display="Log in" type="submit" data-testID="submit" />
            </form>
            <a onClick={() => setRegisterView(true)}>Register</a>
          </>
        )}
      </div>
    </main>
  );
};
