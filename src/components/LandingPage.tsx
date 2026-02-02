import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FC } from 'react';

interface LandingPageProps {
  onRoleSelect: (role: 'admin' | 'user') => void;
}

const LandingPage: FC<LandingPageProps> = ({ onRoleSelect }) => (
  <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
    <Row className="w-100 justify-content-center">
      <Col md={10} lg={8}>
        <Card className="border-0 shadow-lg">
          <Card.Body className="text-center p-5">
            <h1 className="display-4 fw-bold text-primary mb-4">Studio Ghibli Grants</h1>
            <p className="lead text-muted mb-5">
              €2.5M available across 25 grants supporting UN Sustainable Development Goals
            </p>
            
            <Row className="g-4">
              <Col md={6}>
                <Card className="h-100 border-0 hover-card" onClick={() => onRoleSelect('admin')}>
                  <Card.Body className="p-4">
                    <div className="mb-3 text-center">
                      <i className="fas fa-shield-alt text-primary fs-1"></i>
                    </div>
                    <Card.Title className="h4 fw-bold mb-3">Admin Portal</Card.Title>
                    <Card.Text className="text-muted mb-4">Manage grants & applications</Card.Text>
                    <Button variant="primary" size="lg" className="w-100">Admin Login</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100 border-0 hover-card" onClick={() => onRoleSelect('user')}>
                  <Card.Body className="p-4">
                    <div className="mb-3 text-center">
                      <i className="fas fa-user text-success fs-1"></i>
                    </div>
                    <Card.Title className="h4 fw-bold mb-3">Applicant Portal</Card.Title>
                    <Card.Text className="text-muted mb-4">Apply for Teto Grant (€10,000)</Card.Text>
                    <Button variant="success" size="lg" className="w-100">Applicant Login</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default LandingPage;