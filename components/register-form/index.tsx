import React from 'react';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import styles from './register-form.module.css';

interface Values {
  phone: string;
  password: string;
}

interface Props {
  onSubmit?: (data: Values) => Promise<void>;
  onBack?: () => void;
}

export default function RegisterForm(props: Props) {
  return (
    <div className={styles.login_box + ' p-3'}>
      <h4 onClick={() => props?.onBack?.()} className="display-9 mb-3" style={{ cursor: 'pointer' }}>
        {'⬅ Login'}
      </h4>
      <Formik
        initialValues={{
          phone: '',
          password: '',
          nickname: '',
        }}
        onSubmit={async (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
          setSubmitting(true);
          await props?.onSubmit?.(values);
          setSubmitting(false);
        }}
      >
        <Form>
          <div className="mb-3">
            <Field className="form-control" id="nickname" name="nickname" placeholder="Nickname" type="input" />
          </div>
          <div className="mb-3">
            <Field type="tel" className="form-control" id="phone" name="phone" placeholder="Phone" />
          </div>

          <div className="mb-3">
            <Field className="form-control" id="password" name="password" placeholder="Password" type="password" />
          </div>

          <div className="d-flex flex-row align-items-center justify-content-between">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
