import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import {useAuth0} from '@auth0/auth0-react';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const validateMessages = {
  required: '${label} es requerido!',
  types: {
    email: '${label} no es un email válido!',
  },
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

const CrearAlumno = () => {
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
  const [form] = Form.useForm(); // Inicializar el formulario
  const { user, isAuthenticated, logout, getIdTokenClaims } = useAuth0();

  const onFinish = async (values) => {
    console.log(values); // Para depuración

    const alumnoData = {
      usuario: user.email,
      firstname: values.firstname,
      lastname: values.lastname,
      grado: values.grado,
      instituto: values.instituto,
    };

    try {
      setLoading(true); // Iniciar loading

      const url = 'http://localhost:4000/api/alumno'; 
      const method = 'POST'; 

      // Enviar datos a la API
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alumnoData), 
      });

      
      if (!response.ok) {
        throw new Error('Error al crear el alumno');
      }

      const result = await response.json();
      console.log(result); 
      openNotificationWithIcon('success', 'Alumno guardado', 'El Alumno se ha guardado exitosamente.');
      form.resetFields();
     
    } catch (error) {
      console.error('Error al crear el alumno:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el alumno.');
 
    } finally {
      setLoading(false); // Detener loading
    }
  };

  return (
    <Form
      {...layout}
      form={form} // Asociar el formulario
      name="nest-messages"
      onFinish={onFinish}
      style={{
        maxWidth: 600,
      }}
      validateMessages={validateMessages}
    >
      <Form.Item
        name="firstname"
        label="Nombre"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="lastname"
        label="Apellido"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="grado"
        label="Grado"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      
      <Form.Item
        name="instituto"
        label="Instituto"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        wrapperCol={{
          ...layout.wrapperCol,
          offset: 8,
        }}
      >
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Alumno
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearAlumno;

