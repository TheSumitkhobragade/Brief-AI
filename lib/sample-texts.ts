export interface SampleText {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: "healthcare-ai",
    title: "AI in Modern Healthcare",
    category: "Academic / Medical",
    content: `Artificial intelligence (AI) is transforming the landscape of modern medicine and healthcare delivery across the globe. Machine learning algorithms, particularly deep learning models trained on millions of medical images, are achieving diagnostic accuracy comparable to, and in some instances exceeding, board-certified radiologists and pathologists. For example, convolutional neural networks (CNNs) have shown exceptional capability in detecting early-stage malignant melanoma from dermoscopic photographs and identifying subtle microcalcifications in mammography scans that may indicate initial breast neoplasia.

Beyond diagnostic imaging, natural language processing (NLP) models are revolutionizing electronic health record (EHR) management. Clinicians traditionally spend up to two hours documenting medical interactions for every one hour spent in direct patient contact. By implementing ambient clinical voice intelligence, NLP systems transcribe doctor-patient conversations in real time, extract clinically relevant symptoms, and automatically generate structured clinical progress notes formatted to SOAP (Subjective, Objective, Assessment, Plan) guidelines.

Furthermore, predictive analytics is dramatically improving hospital inpatient outcomes. Sepsis prediction algorithms monitor physiological signals including heart rate variability, arterial blood pressure, and lactate concentrations to alert intensive care staff hours before septic shock manifests clinically. In pharmacogenomics and molecular biology, generative models such as AlphaFold have resolved hundreds of thousands of protein structures, accelerating candidate drug discovery and minimizing laboratory synthesis costs from years down to months.

However, significant challenges persist. Algorithmic bias resulting from unrepresentative demographic datasets poses severe health equity risks. Furthermore, regulatory hurdles, cybersecurity vulnerabilities regarding protected health information (PHI), and the 'black-box' opacity of deep neural networks create ethical and accountability concerns that necessitate continuous oversight, rigorous clinical trials, and clear explainability frameworks.`
  },
  {
    id: "legal-privacy",
    title: "Terms of Service & Data Policy",
    category: "Legal / Compliance",
    content: `Section 4. Data Collection, Telemetry, and Third-Party Integrations.
By accessing and creating an account on the CloudPlatform Services ('Platform'), you expressly acknowledge and grant CloudPlatform LLC an irrevocable, worldwide, non-exclusive license to process, store, index, and analyze all telemetry data generated during your interaction with our infrastructure. Telemetry data includes, but is not limited to, source IP addresses, browser fingerprinting parameters, geographic location derived through network latency estimation, operating system kernel configurations, session duration, clickstream metadata, and peripheral device hardware identifiers.

Section 5. Automated Decision-Making and Profiling.
We utilize proprietary machine learning algorithms to evaluate user behaviors for fraud mitigation, platform security enforcement, and personalized commercial communications. These automated systems may temporarily restrict access to billing functionalities or initiate step-up multi-factor authentication protocols if anomalous execution paths are detected. Users within certain jurisdictions (including the European Economic Area under GDPR Article 22) retain the right to contest automated evaluations and request human review within thirty (30) business days following notification.

Section 6. Data Retention, Portability, and Right to Deletion.
Account records are preserved for the active lifespan of the account plus a statutory dormancy buffer of twenty-four (24) calendar months following termination. Upon receipt of a verifiable Data Subject Access Request (DSAR), CloudPlatform shall furnish an export of user-provided content in a machine-readable JSON structure. Certain encrypted transactional audit trails must be retained indefinitely to satisfy anti-money laundering (AML) and federal financial reporting compliance requirements.`
  },
  {
    id: "quarterly-report",
    title: "Enterprise Q3 Financial Review",
    category: "Business / Finance",
    content: `Executive Summary: Q3 Financial Performance and Global Strategic Transformation.
Nexus Enterprise Solutions delivered record-breaking performance in the third quarter of Fiscal Year 2026, achieving total consolidated revenue of $4.85 billion—a 23.4% year-over-year increase compared to $3.93 billion reported in Q3 2025. This acceleration was primarily propelled by unprecedented enterprise adoption of our Sovereign Cloud and Automated Governance Suite, which generated $1.62 billion in recurring subscription revenue alone, reflecting a net revenue retention (NRR) rate of 128%.

Operating Income and Margin Expansion:
Operating income for the quarter reached $1.21 billion, representing an operating margin of 24.9%, an expansion of 320 basis points over the previous fiscal period. Gross margins expanded to 74.2%, supported by structural cost efficiencies attained via our migration to next-generation energy-efficient custom silicon compute clusters. Operating cash flow stood robustly at $1.44 billion, with adjusted free cash flow totaling $1.15 billion after deducting capital expenditures of $290 million allocated toward global data center expansion in Mumbai, Frankfurt, and Tokyo.

Strategic Capital Allocation and FY2027 Outlook:
The Board of Directors has authorized a $1.2 billion expansion to our share repurchase program and declared a quarterly dividend of $0.42 per share. Looking ahead to Q4 and early FY2027, management is raising full-year revenue guidance to a range between $19.4 billion and $19.7 billion. Strategic priorities remain focused on edge computing AI agents, continuous security compliance automation, and targeted tuck-in acquisitions in the cybersecurity analytics space.`
  },
  {
    id: "quantum-computing",
    title: "Quantum Computing & Cryptography",
    category: "Technology / Cybersecurity",
    content: `The imminent transition toward cryptographically relevant quantum computers (CRQCs) presents an existential challenge to contemporary cybersecurity architectures. Classical public-key cryptography—predominantly RSA, Diffie-Hellman (DH), and Elliptic Curve Cryptography (ECC)—relies intrinsically on the mathematical intractability of two fundamental problems: prime number factorization and the discrete logarithm problem. Shor's algorithm, formulated by Peter Shor in 1994, demonstrated theoretically that a sufficiently fault-tolerant quantum computer utilizing quantum superposition and entanglement can solve both mathematical problems in polynomial time (O((log N)^3)).

In response to this looming technological inflection point, the National Institute of Standards and Technology (NIST) conducted an intensive six-year Post-Quantum Cryptography (PQC) standardization competition. In 2024, NIST released the first standardized quantum-resistant algorithms: ML-KEM (derived from CRYSTALS-Kyber) for general public-key encryption and key encapsulation, and ML-DSA (derived from CRYSTALS-Dilithium) and SLH-DSA (SPHINCS+) for digital signatures. These algorithms are constructed upon alternative mathematical foundations, primarily high-dimensional lattice theory and cryptographic hash trees, which remain immune to both classical and quantum algorithmic speedups.

Organizations must prioritize immediate cryptographic inventory discovery. Adversarial state actors are currently practicing 'Harvest Now, Decrypt Later' (HNDL) attacks—intercepting and storing petabytes of encrypted governmental, financial, and proprietary enterprise communications today with the intent of deciphering them once quantum hardware reaches physical fault tolerance.`
  }
];
