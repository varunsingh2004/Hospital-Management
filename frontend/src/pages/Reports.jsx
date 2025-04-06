import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportAPI from '../api/reportAPI';
import { Button, Card, Input, Select, DatePicker, Table, Badge, message, Tooltip, Modal, Row, Col } from 'antd';
import { PlusOutlined, FileSearchOutlined, EditOutlined, PrinterOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    patientFilter: '',
    doctorFilter: '',
    startDate: null,
    endDate: null,
    diagnosisFilter: '',
    status: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReports(filters);
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch reports');
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchReports();
  };

  const handleReset = () => {
    setFilters({
      patientFilter: '',
      doctorFilter: '',
      startDate: null,
      endDate: null,
      diagnosisFilter: '',
      status: ''
    });
    // Wait for state to update before fetching
    setTimeout(fetchReports, 0);
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0]?.format('YYYY-MM-DD'),
        endDate: dates[1]?.format('YYYY-MM-DD')
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: null,
        endDate: null
      }));
    }
  };

  const showDeleteConfirm = (reportId) => {
    confirm({
      title: 'Are you sure you want to delete this report?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await reportAPI.deleteReport(reportId);
          message.success('Report deleted successfully');
          fetchReports(); // Refresh the list
        } catch (error) {
          message.error('Failed to delete report');
          console.error('Error deleting report:', error);
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'draft':
        color = 'orange';
        break;
      case 'final':
        color = 'green';
        break;
      case 'amended':
        color = 'blue';
        break;
      default:
        color = 'default';
    }
    return <Badge status={color} text={status.charAt(0).toUpperCase() + status.slice(1)} />;
  };

  const columns = [
    {
      title: 'Report ID',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 180,
      sorter: (a, b) => (a.reportId || '').localeCompare(b.reportId || ''),
      render: (text, record) => <span className="font-semibold">{text || `REP-${record._id.substring(0, 6)}`}</span>
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 150,
      sorter: (a, b) => a.patientName.localeCompare(b.patientName)
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 150,
      sorter: (a, b) => a.doctorName.localeCompare(b.doctorName)
    },
    {
      title: 'Date',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 160,
      sorter: (a, b) => new Date(a.reportDate) - new Date(b.reportDate),
      render: (text) => reportAPI.formatDate(text)
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (diagnosis) => (
        <Tooltip placement="topLeft" title={diagnosis}>
          {diagnosis.length > 30 ? `${diagnosis.substring(0, 30)}...` : diagnosis}
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 430,
      render: (_, record) => (
        <Row gutter={[12, 8]} justify="start" align="middle" className="flex-wrap">
          <Col>
            <Link to={`/reports/${record._id}`}>
              <Button type="primary" icon={<FileSearchOutlined />} size="middle" className="min-w-[90px]">
                View
              </Button>
            </Link>
          </Col>
          <Col>
            <Link to={`/reports/edit/${record._id}`}>
              <Button type="default" icon={<EditOutlined />} size="middle" className="min-w-[90px]">
                Edit
              </Button>
            </Link>
          </Col>
          <Col>
            <Link to={`/reports/print/${record._id}`}>
              <Button type="default" icon={<PrinterOutlined />} size="middle" className="min-w-[90px]">
                Print
              </Button>
            </Link>
          </Col>
          <Col>
            <Button 
              danger
              icon={<DeleteOutlined />}
              size="middle"
              className="min-w-[90px]"
              onClick={() => showDeleteConfirm(record._id)}
            >
              Delete
            </Button>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div className="reports-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Reports</h1>
        <Link to="/reports/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Report
          </Button>
        </Link>
      </div>

      <Card title="Filter Reports" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <Input
              placeholder="Search by patient name or ID"
              value={filters.patientFilter}
              onChange={(e) => handleFilterChange('patientFilter', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <Input
              placeholder="Search by doctor name or ID"
              value={filters.doctorFilter}
              onChange={(e) => handleFilterChange('doctorFilter', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <Input
              placeholder="Search by diagnosis"
              value={filters.diagnosisFilter}
              onChange={(e) => handleFilterChange('diagnosisFilter', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              placeholder="Select status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="draft">Draft</Option>
              <Option value="final">Final</Option>
              <Option value="amended">Amended</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={reports}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total ${total} reports`
        }}
        className="report-table"
      />
    </div>
  );
};

export default Reports; 