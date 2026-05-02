import { v4 as uuidv4 } from 'uuid';

const createNodes = (definitions) => {
  return definitions.map(def => ({
    id: def.id,
    type: def.type,
    position: def.pos,
    data: { label: def.label }
  }));
};

const createEdges = (definitions) => {
  return definitions.map(def => ({
    id: uuidv4(),
    source: def.source,
    target: def.target,
    sourceHandle: 'right',
    targetHandle: 'left'
  }));
};

export const TEMPLATE_CATEGORIES = {
  AIML: "AI & Machine Learning",
  FINANCIAL: "Financial Services",
  ECOMMERCE: "E-Commerce",
  CLOUD: "Cloud Infrastructure",
  DATA: "Data Engineering",
  IDENTITY: "Identity & Access",
  IOT: "Internet of Things",
  WEB: "Web & Mobile App"
};

export const TEMPLATES = {
  // --- AI/ML ---
  agentic_ai: {
    name: "Agentic AI System",
    category: TEMPLATE_CATEGORIES.AIML,
    desc: "Autonomous LLM agents with tool access.",
    data: () => {
      const u = uuidv4(), g = uuidv4(), llm = uuidv4(), t = uuidv4(), d = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 50, y: 250 }, label: 'User' },
          { id: g, type: 'process', pos: { x: 250, y: 250 }, label: 'Orchestrator' },
          { id: llm, type: 'entity', pos: { x: 500, y: 150 }, label: 'LLM API (OpenAI)' },
          { id: t, type: 'process', pos: { x: 500, y: 350 }, label: 'Tool Execution (Sandbox)' },
          { id: d, type: 'datastore', pos: { x: 750, y: 350 }, label: 'Memory DB' }
        ]),
        edges: createEdges([
          { source: u, target: g }, { source: g, target: llm }, { source: g, target: t }, { source: t, target: d }
        ]),
        threats: {}
      };
    }
  },
  rag_pipeline: {
    name: "RAG Pipeline",
    category: TEMPLATE_CATEGORIES.AIML,
    desc: "Retrieval-Augmented Generation architecture.",
    data: () => {
      const u = uuidv4(), api = uuidv4(), vdb = uuidv4(), llm = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 50, y: 200 }, label: 'User' },
          { id: api, type: 'process', pos: { x: 300, y: 200 }, label: 'Backend API' },
          { id: vdb, type: 'datastore', pos: { x: 550, y: 100 }, label: 'Vector Database' },
          { id: llm, type: 'entity', pos: { x: 550, y: 300 }, label: 'LLM Service' }
        ]),
        edges: createEdges([{ source: u, target: api }, { source: api, target: vdb }, { source: api, target: llm }]),
        threats: {}
      };
    }
  },
  model_training: {
    name: "LLM Training Pipeline",
    category: TEMPLATE_CATEGORIES.AIML,
    desc: "Data ingestion, cleaning, and model training.",
    data: () => {
      const raw = uuidv4(), clean = uuidv4(), store = uuidv4(), train = uuidv4(), reg = uuidv4();
      return {
        nodes: createNodes([
          { id: raw, type: 'entity', pos: { x: 50, y: 200 }, label: 'Raw Data Source' },
          { id: clean, type: 'process', pos: { x: 300, y: 200 }, label: 'Data Scrubber' },
          { id: store, type: 'datastore', pos: { x: 550, y: 100 }, label: 'Training Data Lake' },
          { id: train, type: 'process', pos: { x: 550, y: 300 }, label: 'GPU Cluster' },
          { id: reg, type: 'datastore', pos: { x: 800, y: 300 }, label: 'Model Registry' }
        ]),
        edges: createEdges([{ source: raw, target: clean }, { source: clean, target: store }, { source: store, target: train }, { source: train, target: reg }]),
        threats: {}
      };
    }
  },

  // --- FINANCIAL ---
  payment_gateway: {
    name: "Payment Gateway",
    category: TEMPLATE_CATEGORIES.FINANCIAL,
    desc: "PCI-DSS compliant payment processing.",
    data: () => {
      const u = uuidv4(), w = uuidv4(), p = uuidv4(), db = uuidv4(), bank = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 50, y: 250 }, label: 'Customer' },
          { id: w, type: 'process', pos: { x: 250, y: 250 }, label: 'E-Comm Server' },
          { id: p, type: 'process', pos: { x: 500, y: 250 }, label: 'Payment Gateway' },
          { id: db, type: 'datastore', pos: { x: 500, y: 100 }, label: 'Token Vault' },
          { id: bank, type: 'entity', pos: { x: 750, y: 250 }, label: 'Acquiring Bank' }
        ]),
        edges: createEdges([{ source: u, target: w }, { source: w, target: p }, { source: p, target: db }, { source: p, target: bank }]),
        threats: {}
      };
    }
  },
  core_banking: {
    name: "Core Banking API",
    category: TEMPLATE_CATEGORIES.FINANCIAL,
    desc: "Internal banking transactions and ledgers.",
    data: () => {
      const g = uuidv4(), auth = uuidv4(), tx = uuidv4(), led = uuidv4();
      return {
        nodes: createNodes([
          { id: g, type: 'process', pos: { x: 100, y: 200 }, label: 'API Gateway' },
          { id: auth, type: 'process', pos: { x: 350, y: 100 }, label: 'Auth Service' },
          { id: tx, type: 'process', pos: { x: 350, y: 300 }, label: 'Transaction Engine' },
          { id: led, type: 'datastore', pos: { x: 600, y: 300 }, label: 'Ledger DB' }
        ]),
        edges: createEdges([{ source: g, target: auth }, { source: g, target: tx }, { source: tx, target: led }]),
        threats: {}
      };
    }
  },
  crypto_exchange: {
    name: "Crypto Exchange",
    category: TEMPLATE_CATEGORIES.FINANCIAL,
    desc: "Hot wallet and order matching engine.",
    data: () => {
      const u = uuidv4(), match = uuidv4(), hot = uuidv4(), cold = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 100, y: 200 }, label: 'Trader' },
          { id: match, type: 'process', pos: { x: 350, y: 200 }, label: 'Matching Engine' },
          { id: hot, type: 'process', pos: { x: 600, y: 100 }, label: 'Hot Wallet Node' },
          { id: cold, type: 'datastore', pos: { x: 600, y: 300 }, label: 'Cold Storage' }
        ]),
        edges: createEdges([{ source: u, target: match }, { source: match, target: hot }, { source: hot, target: cold }]),
        threats: {}
      };
    }
  },

  // --- ECOMMERCE ---
  b2c_checkout: {
    name: "Standard B2C Checkout",
    category: TEMPLATE_CATEGORIES.ECOMMERCE,
    desc: "Typical web store architecture.",
    data: () => {
      const u = uuidv4(), web = uuidv4(), inv = uuidv4(), db = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 100, y: 200 }, label: 'Shopper' },
          { id: web, type: 'process', pos: { x: 350, y: 200 }, label: 'Storefront' },
          { id: inv, type: 'process', pos: { x: 600, y: 100 }, label: 'Inventory Service' },
          { id: db, type: 'datastore', pos: { x: 600, y: 300 }, label: 'Product DB' }
        ]),
        edges: createEdges([{ source: u, target: web }, { source: web, target: inv }, { source: web, target: db }]),
        threats: {}
      };
    }
  },
  b2b_market: {
    name: "B2B Marketplace",
    category: TEMPLATE_CATEGORIES.ECOMMERCE,
    desc: "Multi-vendor supplier portal.",
    data: () => {
      const v = uuidv4(), b = uuidv4(), api = uuidv4(), db = uuidv4();
      return {
        nodes: createNodes([
          { id: v, type: 'entity', pos: { x: 100, y: 100 }, label: 'Vendor' },
          { id: b, type: 'entity', pos: { x: 100, y: 300 }, label: 'Buyer' },
          { id: api, type: 'process', pos: { x: 350, y: 200 }, label: 'Marketplace API' },
          { id: db, type: 'datastore', pos: { x: 600, y: 200 }, label: 'Tenant DB' }
        ]),
        edges: createEdges([{ source: v, target: api }, { source: b, target: api }, { source: api, target: db }]),
        threats: {}
      };
    }
  },

  // --- CLOUD ---
  serverless: {
    name: "Serverless API",
    category: TEMPLATE_CATEGORIES.CLOUD,
    desc: "AWS API Gateway + Lambda + DynamoDB.",
    data: () => {
      const c = uuidv4(), g = uuidv4(), l = uuidv4(), d = uuidv4();
      return {
        nodes: createNodes([
          { id: c, type: 'entity', pos: { x: 100, y: 200 }, label: 'Client' },
          { id: g, type: 'process', pos: { x: 300, y: 200 }, label: 'API Gateway' },
          { id: l, type: 'process', pos: { x: 500, y: 200 }, label: 'Lambda Function' },
          { id: d, type: 'datastore', pos: { x: 700, y: 200 }, label: 'DynamoDB' }
        ]),
        edges: createEdges([{ source: c, target: g }, { source: g, target: l }, { source: l, target: d }]),
        threats: {}
      };
    }
  },
  k8s_cluster: {
    name: "Kubernetes Cluster",
    category: TEMPLATE_CATEGORIES.CLOUD,
    desc: "Ingress controller routing to microservices.",
    data: () => {
      const ing = uuidv4(), pod1 = uuidv4(), pod2 = uuidv4(), rds = uuidv4();
      return {
        nodes: createNodes([
          { id: ing, type: 'process', pos: { x: 100, y: 200 }, label: 'K8s Ingress' },
          { id: pod1, type: 'process', pos: { x: 350, y: 100 }, label: 'Pod A (Web)' },
          { id: pod2, type: 'process', pos: { x: 350, y: 300 }, label: 'Pod B (Worker)' },
          { id: rds, type: 'datastore', pos: { x: 600, y: 200 }, label: 'Cloud SQL / RDS' }
        ]),
        edges: createEdges([{ source: ing, target: pod1 }, { source: ing, target: pod2 }, { source: pod1, target: rds }]),
        threats: {}
      };
    }
  },

  // --- DATA ---
  data_lake: {
    name: "Data Lakehouse",
    category: TEMPLATE_CATEGORIES.DATA,
    desc: "Ingestion into S3/GCS with query engine.",
    data: () => {
      const src = uuidv4(), pipe = uuidv4(), lake = uuidv4(), query = uuidv4();
      return {
        nodes: createNodes([
          { id: src, type: 'entity', pos: { x: 100, y: 200 }, label: 'External API' },
          { id: pipe, type: 'process', pos: { x: 300, y: 200 }, label: 'Ingestion Pipeline' },
          { id: lake, type: 'datastore', pos: { x: 500, y: 200 }, label: 'S3 Object Storage' },
          { id: query, type: 'process', pos: { x: 700, y: 200 }, label: 'Athena/BigQuery' }
        ]),
        edges: createEdges([{ source: src, target: pipe }, { source: pipe, target: lake }, { source: lake, target: query }]),
        threats: {}
      };
    }
  },
  streaming: {
    name: "Event Streaming",
    category: TEMPLATE_CATEGORIES.DATA,
    desc: "Kafka/PubSub streaming architecture.",
    data: () => {
      const prod = uuidv4(), kafka = uuidv4(), cons = uuidv4();
      return {
        nodes: createNodes([
          { id: prod, type: 'process', pos: { x: 100, y: 200 }, label: 'Producer Service' },
          { id: kafka, type: 'datastore', pos: { x: 400, y: 200 }, label: 'Kafka Cluster' },
          { id: cons, type: 'process', pos: { x: 700, y: 200 }, label: 'Consumer Service' }
        ]),
        edges: createEdges([{ source: prod, target: kafka }, { source: kafka, target: cons }]),
        threats: {}
      };
    }
  },

  // --- IDENTITY ---
  oauth_flow: {
    name: "OAuth2 Flow",
    category: TEMPLATE_CATEGORIES.IDENTITY,
    desc: "Client requesting token from Authorization Server.",
    data: () => {
      const u = uuidv4(), c = uuidv4(), auth = uuidv4(), rs = uuidv4();
      return {
        nodes: createNodes([
          { id: u, type: 'entity', pos: { x: 100, y: 100 }, label: 'Resource Owner' },
          { id: c, type: 'process', pos: { x: 100, y: 300 }, label: 'Client App' },
          { id: auth, type: 'process', pos: { x: 400, y: 200 }, label: 'Auth Server' },
          { id: rs, type: 'datastore', pos: { x: 700, y: 200 }, label: 'Resource Server' }
        ]),
        edges: createEdges([{ source: u, target: c }, { source: c, target: auth }, { source: c, target: rs }]),
        threats: {}
      };
    }
  },

  // --- IOT ---
  smart_home: {
    name: "Smart Home Hub",
    category: TEMPLATE_CATEGORIES.IOT,
    desc: "Local hub syncing sensors to cloud.",
    data: () => {
      const s = uuidv4(), h = uuidv4(), c = uuidv4(), db = uuidv4();
      return {
        nodes: createNodes([
          { id: s, type: 'entity', pos: { x: 100, y: 200 }, label: 'Thermostat Sensor' },
          { id: h, type: 'process', pos: { x: 300, y: 200 }, label: 'Local Hub' },
          { id: c, type: 'process', pos: { x: 500, y: 200 }, label: 'IoT Cloud Core' },
          { id: db, type: 'datastore', pos: { x: 700, y: 200 }, label: 'Telemetry DB' }
        ]),
        edges: createEdges([{ source: s, target: h }, { source: h, target: c }, { source: c, target: db }]),
        threats: {}
      };
    }
  },

  // --- WEB ---
  pwa: {
    name: "Progressive Web App",
    category: TEMPLATE_CATEGORIES.WEB,
    desc: "Offline-first application architecture.",
    data: () => {
      const b = uuidv4(), sw = uuidv4(), idb = uuidv4(), api = uuidv4();
      return {
        nodes: createNodes([
          { id: b, type: 'entity', pos: { x: 100, y: 200 }, label: 'Browser UI' },
          { id: sw, type: 'process', pos: { x: 350, y: 200 }, label: 'Service Worker' },
          { id: idb, type: 'datastore', pos: { x: 350, y: 50 }, label: 'IndexedDB' },
          { id: api, type: 'process', pos: { x: 600, y: 200 }, label: 'Cloud API' }
        ]),
        edges: createEdges([{ source: b, target: sw }, { source: sw, target: idb }, { source: sw, target: api }]),
        threats: {}
      };
    }
  }
};
