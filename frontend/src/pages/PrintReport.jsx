import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Divider, Spin, Typography, Row, Col, message, Alert } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import reportAPI from '../api/reportAPI';

const { Title, Text } = Typography;

const PrintReport = () => {
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

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/reports/${id}`);
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
    <div className="print-report-page">
      <div className="no-print flex justify-between items-center mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back to Report
        </Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print Report
        </Button>
      </div>

      <div className="print-content bg-white p-6 rounded shadow">
        <div className="text-center mb-6">
          <Title level={2}>Medical Report</Title>
          <Text className="text-lg">DANPHEH Medical Center</Text>
          <div className="mt-2">
            <Text>123 Healthcare Avenue, Anytown, USA</Text>
            <br />
            <Text>Phone: (555) 123-4567</Text>
            <br />
            <Text>Email: info@danpheh.com</Text>
          </div>
        </div>

        <Divider />

        <Row gutter={16} className="mb-4">
          <Col span={24}>
            <div className="flex justify-between items-center">
              <div>
                <Text strong>Report ID:</Text> {report.reportId}
              </div>
              <div>
                <Text strong>Date:</Text> {reportAPI.formatDate(report.reportDate)}
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={16} className="mb-4">
          <Col xs={24} md={12}>
            <div className="border p-4 h-full">
              <Text strong className="block mb-2">Patient Information</Text>
              <div>
                <Text>Name: </Text>
                <Text>{report.patientName}</Text>
              </div>
              <div>
                <Text>Patient ID: </Text>
                <Text>{report.patientId}</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="border p-4 h-full">
              <Text strong className="block mb-2">Attending Physician</Text>
              <div>
                <Text>Doctor: </Text>
                <Text>{report.doctorName}</Text>
              </div>
            </div>
          </Col>
        </Row>

        <div className="mb-6">
          <Title level={4}>Symptoms</Title>
          <div className="border p-4 whitespace-pre-line">
            {report.symptoms}
          </div>
        </div>

        <div className="mb-6">
          <Title level={4}>Diagnosis</Title>
          <div className="border p-4 whitespace-pre-line">
            {report.diagnosis}
          </div>
        </div>

        {report.treatment && (
          <div className="mb-6">
            <Title level={4}>Treatment Plan</Title>
            <div className="border p-4 whitespace-pre-line">
              {report.treatment}
            </div>
          </div>
        )}

        {report.vitalSigns && Object.values(report.vitalSigns).some(v => v) && (
          <div className="mb-6">
            <Title level={4}>Vital Signs</Title>
            <div className="border p-4">
              <Row gutter={[16, 8]}>
                {report.vitalSigns.temperature && (
                  <Col xs={12} md={8}>
                    <Text strong>Temperature: </Text>
                    <Text>{report.vitalSigns.temperature} °F</Text>
                  </Col>
                )}
                {report.vitalSigns.bloodPressure && (
                  <Col xs={12} md={8}>
                    <Text strong>Blood Pressure: </Text>
                    <Text>{report.vitalSigns.bloodPressure}</Text>
                  </Col>
                )}
                {report.vitalSigns.heartRate && (
                  <Col xs={12} md={8}>
                    <Text strong>Heart Rate: </Text>
                    <Text>{report.vitalSigns.heartRate} bpm</Text>
                  </Col>
                )}
                {report.vitalSigns.respiratoryRate && (
                  <Col xs={12} md={8}>
                    <Text strong>Respiratory Rate: </Text>
                    <Text>{report.vitalSigns.respiratoryRate} breaths/min</Text>
                  </Col>
                )}
                {report.vitalSigns.oxygenSaturation && (
                  <Col xs={12} md={8}>
                    <Text strong>O₂ Saturation: </Text>
                    <Text>{report.vitalSigns.oxygenSaturation}%</Text>
                  </Col>
                )}
                {report.vitalSigns.height && (
                  <Col xs={12} md={8}>
                    <Text strong>Height: </Text>
                    <Text>{report.vitalSigns.height} cm</Text>
                  </Col>
                )}
                {report.vitalSigns.weight && (
                  <Col xs={12} md={8}>
                    <Text strong>Weight: </Text>
                    <Text>{report.vitalSigns.weight} kg</Text>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        )}

        {report.medications && report.medications.length > 0 && (
          <div className="mb-6">
            <Title level={4}>Prescribed Medications</Title>
            <div className="border p-4">
              {report.medications.map((med, index) => (
                <div key={index} className={index > 0 ? 'mt-3 pt-3 border-t' : ''}>
                  <Text strong>{med.name}</Text> - {med.dosage}, {med.frequency}, {med.duration}
                  {med.notes && <div className="ml-4 mt-1 text-gray-600">{med.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {report.tests && report.tests.length > 0 && (
          <div className="mb-6">
            <Title level={4}>Ordered Tests</Title>
            <div className="border p-4">
              {report.tests.map((test, index) => (
                <div key={index} className={index > 0 ? 'mt-3 pt-3 border-t' : ''}>
                  <div className="flex justify-between">
                    <Text strong>{test.name}</Text>
                    <Text>{test.status.toUpperCase()}</Text>
                  </div>
                  {test.date && <div>Date: {reportAPI.formatDate(test.date)}</div>}
                  {test.result && <div>Result: {test.result}</div>}
                  {test.notes && <div className="mt-1 text-gray-600">{test.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {report.recommendations && (
          <div className="mb-6">
            <Title level={4}>Recommendations</Title>
            <div className="border p-4 whitespace-pre-line">
              {report.recommendations}
            </div>
          </div>
        )}

        {report.followUpDate && (
          <div className="mb-6">
            <Title level={4}>Follow-up</Title>
            <div className="border p-4">
              <div>
                <Text strong>Follow-up Date: </Text>
                <Text>{reportAPI.formatDate(report.followUpDate)}</Text>
              </div>
              {report.notes && (
                <div className="mt-2 whitespace-pre-line">
                  <Text strong>Notes: </Text>
                  <div>{report.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <Divider />

        <div className="mt-8">
          <Row>
            <Col span={12} offset={12}>
              <div className="text-center border-t pt-4 mt-8">
                <Text strong>{report.doctorName}</Text>
                <br />
                <Text>Physician Signature</Text>
              </div>
            </Col>
          </Row>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <Text>This report was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</Text>
          <br />
          <Text>Report Status: {report.status.toUpperCase()}</Text>
        </div>
      </div>

      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
            .print-content {
              box-shadow: none;
              padding: 0;
            }
            body {
              font-size: 12pt;
            }
            @page {
              size: portrait;
              margin: 1cm;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrintReport; 