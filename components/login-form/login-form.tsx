import React from 'react';
import Link from 'next/link';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import styles from './login-form.module.css';

interface Values {
  phone: string;
  password: string;
}

interface Props {
  onSubmit?: (data: Values) => Promise<void>;
}

export default function LoginForm(props: Props) {
  return (
    <div className={styles.login_box + ' p-3'}>
      <h1 className="display-6 mb-3">Welcome back Linkey</h1>
      <Formik
        initialValues={{
          phone: '',
          password: '',
        }}
        onSubmit={async (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
          setSubmitting(true);
          await props?.onSubmit?.(values);
          setSubmitting(false);
        }}
      >
        <Form>
          <div className="mb-3">
            <Field type="tel" className="form-control" id="phone" name="phone" placeholder="Phone" />
          </div>

          <div className="mb-3">
            <Field className="form-control" id="password" name="password" placeholder="Password" type="password" />
          </div>

          <div className="d-flex flex-row align-items-center justify-content-between">
            <button type="submit" className="btn btn-primary">
              Login
            </button>

            <Link href="/register">Register</Link>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
