import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification } from 'antd';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const TablaAlumnos = () => {
  const [alumnos, setalumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [alumnoIdToDelete, setalumnoIdToDelete] = useState(null);
  const [currentAlumno, setcurrentAlumno] = useState(null);
  const { user } = useAuth0();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalalumnos, setTotalAlumnos] = useState(0);
  const [form] = Form.useForm(); // Formulario para el modal de edición

  useEffect(() => {
    const fetchAlumnos = async () => {
      if (!user) return; // Asegurarse de que el usuario esté autenticado
      const { current, pageSize } = pagination;
      setLoading(true); // Activamos el estado de carga

      try {
        const response = await axios.get("http://localhost:4000/api/alumnos", {
          params: {
            page: current,
            perPage: pageSize,
            email: user.email, // Pasamos el email del usuario autenticado
          },
        });

        if (Array.isArray(response.data)) {
          setalumnos(response.data);
          // Si tu backend devuelve un campo específico para el total, usa ese valor
          setTotalAlumnos(response.data.length); // O response.data.total, según la API
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching alumnos:', error);
      } finally {
        setLoading(false); // Desactivamos el estado de carga
      }
    };

    fetchAlumnos();
  }, [pagination, user?.email]);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setalumnoIdToDelete(id); // Guardar el ID del alumno a eliminar
    setIsDeleteModalVisible(true); // Mostrar el modal de confirmación de eliminación
  };

  const showEditModal = (alumno) => {
    setcurrentAlumno(alumno); // Guardar el alumno actual a editar
    form.setFieldsValue(alumno); // Rellenar el formulario con los valores actuales del alumno
    setIsEditModalVisible(true); // Mostrar el modal de edición
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false); // Ocultar el modal de eliminación
    setIsEditModalVisible(false); // Ocultar el modal de edición
    form.resetFields(); // Limpiar los campos del formulario
  };

  // Función para manejar la edición de alumnos
  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:4000/api/alumno/${currentAlumno._id}`, values);
      
      // Actualizar el estado con los nuevos datos
      setalumnos((prevalumnos) =>
        prevalumnos.map((alumno) =>
          alumno._id === currentAlumno._id ? { ...alumno, ...values } : alumno
        )
      );

      console.log(`alumno con ID ${currentAlumno._id} actualizado.`);
      setIsEditModalVisible(false); // Cerrar el modal de edición

      openNotificationWithIcon('success', 'alumno Editado', 'El alumno ha sido editado exitosamente.');

    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  // Función para manejar la eliminación de alumnos
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/alumno/${alumnoIdToDelete}`);

      // Actualizar el estado para eliminar el alumno
      setalumnos((prevalumnos) => prevalumnos.filter((alumno) => alumno._id !== alumnoIdToDelete));
    
      setIsDeleteModalVisible(false); // Cerrar el modal de eliminación
      openNotificationWithIcon('success', 'alumno Eliminado', 'El alumno ha sido eliminado exitosamente.');
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const columns = [
    {
      title: 'Apellido',
      dataIndex: 'lastname',
      key: 'lastname',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Nombre',
      dataIndex: 'firstname',
      key: 'firstname',
    },
    {
      title: 'Instituto',
      dataIndex: 'instituto',
      key: 'instituto',
    },
    {
      title: 'Grado',
      dataIndex: 'grado',
      key: 'grado',
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>Editar</a>
          <a onClick={() => showDeleteConfirm(record._id)}>Eliminar</a>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={alumnos}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalalumnos,
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        loading={loading}
      />

      {/* Modal de Confirmación para Eliminación */} 
      <Modal
        title="Confirmar Eliminación"
        visible={isDeleteModalVisible}
        onOk={handleDelete} // Manejar la eliminación al confirmar
        onCancel={handleCancel} // Cerrar el modal al cancelar
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar este alumno?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar alumno"
        visible={isEditModalVisible}
        onCancel={handleCancel}
        footer={null} // No usar el footer predeterminado
      >
        <Form
          form={form}
          onFinish={handleEdit}
        >
          <Form.Item
            name="lastname"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingresa el apellido del alumno' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="firstname"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del alumno' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="instituto"
            label="Instituto"
            rules={[{ required: true, message: 'Por favor ingresa el instituto del alumno' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="grado"
            label="Grado"
            rules={[{ required: true, message: 'Por favor ingresa el grado del alumno' }]}
          >
            <Input />
          </Form.Item>

          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TablaAlumnos;
