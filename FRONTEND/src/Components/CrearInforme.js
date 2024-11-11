import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select } from 'antd';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {useAuth0} from '@auth0/auth0-react';

const { Option } = Select;

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
};

const CrearInforme = ({ informeToAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [alumnos, setAlumnos] = useState([]);
  const { user } = useAuth0();
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [responseText, setResponseText] = useState(''); // Estado para almacenar la respuesta del backend
  const [informeTexto, setInformeTexto] = useState(''); // Estado para almacenar el texto insertado

  useEffect(() => {
    if (informeToAdd) {
      form.setFieldsValue({
        usuario: user.email,
        instituto: informeToAdd.instituto,
        //grado: informeToAdd.grado,
        area: informeToAdd.area,
        feature1: informeToAdd.caracteristica1,
        feature2: informeToAdd.caracteristica2,
        feature3: informeToAdd.caracteristica3,
        feature4: informeToAdd.caracteristica4,
        feature5: informeToAdd.caracteristica5,
        alumno: informeToAdd.alumno,
      });
      setSelectedAlumno(informeToAdd.alumno); // Cargar el alumno seleccionado si se está editando
    }
  }, [informeToAdd, form]);

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        // Filtrar los alumnos por el email del usuario logueado
        const response = await axios.get('http://localhost:4000/api/alumnos', {
          params: {
            email: user.email, // Pasar el email del usuario logueado como parámetro
          },
        });
        if (Array.isArray(response.data)) {
          setAlumnos(response.data);
          console.log(response.data); // Verificar el contenido recibido en la consola
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching alumnos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.email) { // Asegurarse de que el email del usuario esté disponible
      fetchAlumnos();
    }
  }, [user]);

  const onFinish = async (values) => {
    const taskData = {
      usuario: user.email,
      alumno: selectedAlumno?._id, // Usar el ID del alumno seleccionado
      area: values.area,
      instituto: values.instituto, // Agrega el área directamente
      caracteristica1: values.feature1, // Características como propiedades
      caracteristica2: values.feature2,
      caracteristica3: values.feature3,
      caracteristica4: values.feature4,
      caracteristica5: values.feature5,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:4000/api/informes',
        taskData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Error al crear la tarea');
      }

      const result = response.data;
      setResponseText(result.message); // Asumimos que el backend responde con un mensaje
      setInformeTexto(result.informeTexto); // Almacenar el texto insertado en el estado
      form.resetFields();
    } catch (error) {
      console.error('Error al crear la tarea:', error);
    } finally {
      setLoading(false); // Detener loading
    }
  };

  const handleAlumnoSelect = (alumnoId) => {
    const selected = alumnos.find((alumno) => alumno._id === alumnoId);
    if (selected) {
      form.setFieldsValue({ instituto: selected.instituto });
      setSelectedAlumno(selected); // Actualizar el estado del alumno seleccionado
      console.log('Alumno:', selected.firstname, selected.lastname, ' - Instituto:', selected.instituto);
    }
  };
  const caracteristicas = [
    "Responsabilidad",
    "Trabajo grupal",
    "Capacidad Resolutiva",
    "Creatividad",
    "Liderazgo"
  ];
  return (
    <Form
      {...layout}
      name="crear-tasks"
      onFinish={onFinish}
      style={{ maxWidth: 800 }}
      validateMessages={validateMessages}
      form={form}
    >
      <Form.Item
        name="alumno"
        label="Alumno Seleccionado"
        rules={[{ required: true, message: 'Debe seleccionar un alumno' }]}
      >
        <Select
          showSearch
          placeholder="Buscar Alumno"
          optionFilterProp="children"
          onChange={handleAlumnoSelect}  // Verificar que se llame correctamente
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {alumnos.map((alumno) => (
            <Option key={alumno._id} value={alumno._id}>
              {`${alumno.lastname} ${alumno.firstname} - ${alumno.grado} Grado - Colegio: ${alumno.instituto}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="area"
        label="Área"
        rules={[{ required: true, message: 'Debe seleccionar un área' }]}
      >
        <Select
          showSearch
          placeholder="Seleccione un área"
          optionFilterProp="children" // Filtra opciones basadas en el texto dentro de cada Option
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          <Option value="Matemáticas">Matemáticas</Option>
          <Option value="Lengua y Literatura">Lengua y Literatura</Option>
          <Option value="Arte">Arte</Option>
          <Option value="Biología">Biología</Option>
          <Option value="Historia">Historia</Option>
          <Option value="Geografía">Geografía</Option>
          <Option value="Física">Física</Option>
          <Option value="Química">Química</Option>
          <Option value="Educación Física">Educación Física</Option>
        </Select>
      </Form.Item>


      <Form.Item name="instituto" label="Instituto" rules={[{ required: true }]}>
        <Input disabled />
      </Form.Item>

      {caracteristicas.map((caracteristica, index) => (
        <Form.Item
          key={index}
          name={`feature${index + 1}`}
          label={caracteristica}
          rules={[{ required: true, message: `${caracteristica} es requerido` }]}
        >
          <Input placeholder={`Ingrese ${caracteristica.toLowerCase()}`} />
        </Form.Item>
      ))}

      <Form.Item label="Informe" wrapperCol={{ ...layout.wrapperCol }}>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          <ReactMarkdown>{informeTexto}</ReactMarkdown>
        </div>
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Generar Informe
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearInforme;