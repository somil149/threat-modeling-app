import { v4 as uuidv4 } from 'uuid';

export const TEMPLATES = {
  basic_webapp: {
    name: "Basic Web App",
    data: () => {
      const uId = uuidv4();
      const sId = uuidv4();
      const dId = uuidv4();
      return {
        nodes: [
          { id: uId, type: 'entity', position: { x: 100, y: 250 }, data: { label: 'User / Browser' } },
          { id: sId, type: 'process', position: { x: 400, y: 250 }, data: { label: 'Web Server' } },
          { id: dId, type: 'datastore', position: { x: 700, y: 250 }, data: { label: 'User Database' } }
        ],
        edges: [
          { id: `e-${uId}-${sId}`, source: uId, target: sId, sourceHandle: 'right', targetHandle: 'left' },
          { id: `e-${sId}-${dId}`, source: sId, target: dId, sourceHandle: 'right', targetHandle: 'left' }
        ],
        threats: {
          [sId]: [
            { id: uuidv4(), title: 'Cross-Site Scripting (XSS)', category: 'Elevation of Privilege', severity: 'High', desc: 'Attacker injects malicious scripts.', status: 'Open' }
          ],
          [dId]: [
            { id: uuidv4(), title: 'SQL Injection', category: 'Information Disclosure', severity: 'High', desc: 'Attacker queries the database directly.', status: 'Open' }
          ]
        }
      };
    }
  },
  ecommerce: {
    name: "E-Commerce Checkout",
    data: () => {
      const uId = uuidv4();
      const sId = uuidv4();
      const pId = uuidv4();
      const dId = uuidv4();
      return {
        nodes: [
          { id: uId, type: 'entity', position: { x: 100, y: 200 }, data: { label: 'Customer' } },
          { id: sId, type: 'process', position: { x: 350, y: 200 }, data: { label: 'Checkout Service' } },
          { id: pId, type: 'entity', position: { x: 650, y: 100 }, data: { label: 'Stripe API' } },
          { id: dId, type: 'datastore', position: { x: 650, y: 300 }, data: { label: 'Orders DB' } }
        ],
        edges: [
          { id: uuidv4(), source: uId, target: sId, sourceHandle: 'right', targetHandle: 'left' },
          { id: uuidv4(), source: sId, target: pId, sourceHandle: 'right', targetHandle: 'left' },
          { id: uuidv4(), source: sId, target: dId, sourceHandle: 'right', targetHandle: 'left' }
        ],
        threats: {}
      };
    }
  },
  microservices: {
    name: "Microservices Auth",
    data: () => {
      const uId = uuidv4();
      const gId = uuidv4();
      const aId = uuidv4();
      const uSId = uuidv4();
      return {
        nodes: [
          { id: uId, type: 'entity', position: { x: 50, y: 250 }, data: { label: 'Mobile Client' } },
          { id: gId, type: 'process', position: { x: 300, y: 250 }, data: { label: 'API Gateway' } },
          { id: aId, type: 'process', position: { x: 600, y: 150 }, data: { label: 'Auth Service' } },
          { id: uSId, type: 'process', position: { x: 600, y: 350 }, data: { label: 'User Service' } }
        ],
        edges: [
          { id: uuidv4(), source: uId, target: gId, sourceHandle: 'right', targetHandle: 'left' },
          { id: uuidv4(), source: gId, target: aId, sourceHandle: 'right', targetHandle: 'left' },
          { id: uuidv4(), source: gId, target: uSId, sourceHandle: 'right', targetHandle: 'left' }
        ],
        threats: {}
      };
    }
  }
};
