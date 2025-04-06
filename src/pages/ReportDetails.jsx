import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Badge, Tabs, Table, Timeline, Spin, message, Tag, Divider, Alert, Empty } from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  PrinterOutlined,
  FileTextOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import reportAPI from '../api/reportAPI';

const { TabPane } = Tabs;

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getReportById(id);
      setReport(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch report details');
      console.error('Error fetching report:', error);
      setLoading(false);
    }
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

  const getTestStatusTag = (status) => {
    let color;
    switch (status) {
      case 'ordered':
        color = 'orange';
        break;
      case 'in-progress':
        color = 'blue';
        break;
      case 'completed':
        color = 'green';
        break;
      default:
        color = 'default';
    }
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
  };

  const medicationColumns = [
    {
      title: 'Medication',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage'
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: text => text || '-'
    }
  ];

  const testColumns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getTestStatusTag(status)
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => date ? reportAPI.formatDate(date) : '-'
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: text => text || '-'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: text => text || '-'
    }
  ];

  const handlePrint = () => {
    navigate(`/reports/print/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="my-6">
        <Alert
          message="Report Not Found"
          description="The requested medical report could not be found."
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/reports')}>
              Back to Reports
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="report-details-page">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/reports">
            <Button icon={<ArrowLeftOutlined />} className="mr-4">
              Back to Reports
            </Button>
          </Link>
          <h1 className="text-2xl font-bold m-0">Medical Report Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Report
          </Button>
          <Link to={`/reports/edit/${id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Report
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <Descriptions title={report.reportId} bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Status">{getStatusBadge(report.status)}</Descriptions.Item>
          <Descriptions.Item label="Report Date">{reportAPI.formatDate(report.reportDate)}</Descriptions.Item>
          <Descriptions.Item label="Patient">{report.patientName}</Descriptions.Item>
          <Descriptions.Item label="Doctor">{report.doctorName}</Descriptions.Item>
          {report.followUpDate && (
            <Descriptions.Item label="Follow-up Date">{reportAPI.formatDate(report.followUpDate)}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="findings" className="bg-white p-4 rounded shadow mb-6">
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Findings
            </span>
          }
          key="findings"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
            <p className="whitespace-pre-line">{report.symptoms || 'No symptoms recorded'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
            <p className="whitespace-pre-line">{report.diagnosis || 'No diagnosis recorded'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Treatment</h3>
            <p className="whitespace-pre-line">{report.treatment || 'No treatment plan recorded'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <p className="whitespace-pre-line">{report.recommendations || 'No recommendations recorded'}</p>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MedicineBoxOutlined />
              Medications
            </span>
          }
          key="medications"
        >
          {report.medications && report.medications.length > 0 ? (
            <Table
              columns={medicationColumns}
              dataSource={report.medications.map((med, index) => ({ ...med, key: index }))}
              pagination={false}
            />
          ) : (
            <Empty description="No medications prescribed" />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <ExperimentOutlined />
              Tests
            </span>
          }
          key="tests"
        >
          {report.tests && report.tests.length > 0 ? (
            <Table
              columns={testColumns}
              dataSource={report.tests.map((test, index) => ({ ...test, key: index }))}
              pagination={false}
            />
          ) : (
            <Empty description="No tests ordered" />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <PlusOutlined />
              Vital Signs
            </span>
          }
          key="vitals"
        >
          {report.vitalSigns ? (
            <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Temperature">
                {report.vitalSigns.temperature ? `${report.vitalSigns.temperature} °F` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Pressure">
                {report.vitalSigns.bloodPressure || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Heart Rate">
                {report.vitalSigns.heartRate ? `${report.vitalSigns.heartRate} bpm` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Respiratory Rate">
                {report.vitalSigns.respiratoryRate ? `${report.vitalSigns.respiratoryRate} breaths/min` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Oxygen Saturation">
                {report.vitalSigns.oxygenSaturation ? `${report.vitalSigns.oxygenSaturation}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Height">
                {report.vitalSigns.height ? `${report.vitalSigns.height} cm` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {report.vitalSigns.weight ? `${report.vitalSigns.weight} kg` : '-'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="No vital signs recorded" />
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CalendarOutlined />
              Follow-up
            </span>
          }
          key="followup"
        >
          {report.followUpDate ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Follow-up Date</h3>
              <p>{reportAPI.formatDate(report.followUpDate)}</p>
              <Divider />
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="whitespace-pre-line">{report.notes || 'No additional notes'}</p>
            </div>
          ) : (
            <Empty description="No follow-up scheduled" />
          )}
        </TabPane>
      </Tabs>

      <Card title="Report History" className="mb-6">
        <Timeline>
          <Timeline.Item>Report created on {reportAPI.formatDate(report.createdAt)}</Timeline.Item>
          {report.createdAt !== report.updatedAt && (
            <Timeline.Item>Last updated on {reportAPI.formatDate(report.updatedAt)}</Timeline.Item>
          )}
          {report.status === 'final' && (
            <Timeline.Item color="green">Report finalized</Timeline.Item>
          )}
          {report.status === 'amended' && (
            <Timeline.Item color="blue">Report amended</Timeline.Item>
          )}
        </Timeline>
      </Card>
    </div>
  );
};

export default ReportDetails; 