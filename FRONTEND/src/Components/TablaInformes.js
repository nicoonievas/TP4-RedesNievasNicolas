import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification } from 'antd';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const TablaInformes = () => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [informeIdToDelete, setInformeIdToDelete] = useState(null);
  const [currentInforme, setCurrentInforme] = useState(null);
  const { user } = useAuth0();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalInformes, setTotalInformes] = useState(0);
  const [form] = Form.useForm(); // Formulario para el modal de edición


  useEffect(() => {
    const fetchInformes = async () => {
      const { current, pageSize } = pagination;
      if (!user?.email) return; // Asegura que el usuario esté autenticado antes de hacer la solicitud

      try {
        const response = await axios.get("http://localhost:4000/api/informes", {
          params: {
            page: current,
            perPage: pageSize,
            email: user.email, // Agrega el email del usuario a los parámetros
          },
        });

        if (Array.isArray(response.data)) {
          setInformes(response.data);
          setTotalInformes(response.data.length);
          console.log(response.data);
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching informes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInformes();
  }, [pagination, user?.email]); // Dependencia de `user?.email` para recargar cuando el usuario esté disponible


  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setInformeIdToDelete(id); // Guardar el ID del informe a eliminar
    setIsDeleteModalVisible(true); // Mostrar el modal de confirmación de eliminación
  };

  const showEditModal = (informe) => {
    setCurrentInforme(informe); // Guardar el informe actual a editar
    form.setFieldsValue(informe); // Rellenar el formulario con los valores actuales del informe
    setIsEditModalVisible(true); // Mostrar el modal de edición
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false); // Ocultar el modal de eliminación
    setIsEditModalVisible(false); // Ocultar el modal de edición
    form.resetFields(); // Limpiar los campos del formulario
  };

  // Función para manejar la edición de informes
  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:4000/api/informe/${currentInforme._id}`, values);

      // Actualizar el estado con los nuevos datos
      setInformes((prevInformes) =>
        prevInformes.map((informe) =>
          informe._id === currentInforme._id ? { ...informe, ...values } : informe
        )
      );

      setIsEditModalVisible(false); // Cerrar el modal de edición
      openNotificationWithIcon('success', 'Informe Editado', 'El informe ha sido editado exitosamente.');

    } catch (error) {
      console.error('Error editing informe:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al editar el informe.');
    }
  };

  // Función para manejar la eliminación de informes
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/informe/${informeIdToDelete}`);

      // Actualizar el estado para eliminar el informe
      setInformes((prevInformes) => prevInformes.filter((informe) => informe._id !== informeIdToDelete));

      setIsDeleteModalVisible(false); // Cerrar el modal de eliminación
      // Mostrar notificación de éxito
      openNotificationWithIcon('success', 'Informe Eliminado', 'El informe ha sido eliminado exitosamente.');

    } catch (error) {
      console.error("Error deleting informe:", error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al eliminar el informe.');
    }
  };

  const columns = [
    {
      title: 'Alumno',
      key: 'alumno',
      render: (_, record) => (
        <span>{record.alumno ? `${record.alumno.firstname} ${record.alumno.lastname}` : 'Sin alumno'}</span>
      ),
    },
    {
      title: 'Instituto',
      key: 'institute',
      render: (_, record) => (
        <span>{record.alumno ? record.alumno.instituto : 'Sin instituto'}</span>
      ),
    },
    {
      title: 'Grado',
      key: 'grade',
      render: (_, record) => (
        <span>{record.alumno ? record.alumno.grado : 'Sin grado'}</span>
      ),
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Informe',
      key: 'informe',
      render: (_, record) => (
        <a
          href={`http://localhost:4000/api/informePDF/${record._id}?apellido=${record.alumno.lastname}&año=${record.alumno.grado}&area=${record.area}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar
        </a>
      ),
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
        dataSource={informes}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalInformes,
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
        <p>¿Estás seguro de que deseas eliminar este informe?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Informe"
        visible={isEditModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEdit}
        >



          <Form.Item
            name="informeTexto"

            rules={[{ required: true, message: 'Por favor ingresa el informe' }]}
          >
            <Input.TextArea rows={15} />
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

export default TablaInformes;
