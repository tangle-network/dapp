'use client';

import { Blueprint, BlueprintCategory } from '../../types';

export default function useBlueprintListing(): Blueprint[] {
  return [
    {
      name: 'Groth16 ZK-SaaS',
      address: '0x1234567890123456789012345678901234567890',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'A ZK-SaaS service utilizing the Groth16 proving system for efficient and secure zero-knowledge proofs. Ideal for applications requiring fast verification times.',
      restakersCount: 10,
      operatorsCount: 2,
      tvl: '$100',
      isBoosted: true,
    },
    {
      name: 'Plonk Prover Pro',
      address: '0x2345678901234567890123456789012345678901',
      category: BlueprintCategory.CATEGORY_2,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Advanced PLONK-based ZK proof generation.',
      restakersCount: 15,
      operatorsCount: 3,
      tvl: '$150',
      isBoosted: true,
    },
    {
      name: 'Sonic ZK Solutions',
      address: '0x3456789012345678901234567890123456789012',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'High-speed ZK-SNARK service leveraging the Sonic protocol. Our platform offers scalable and efficient zero-knowledge proofs for a wide range of applications, from privacy-preserving transactions to secure data verification.',
      restakersCount: 8,
      operatorsCount: 2,
      tvl: '$80',
      isBoosted: true,
    },
    {
      name: 'Marlin ZK Platform',
      address: '0x4567890123456789012345678901234567890123',
      category: BlueprintCategory.CATEGORY_3,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Scalable ZK proof generation using Marlin.',
      restakersCount: 12,
      operatorsCount: 4,
      tvl: '$120',
    },
    {
      name: 'Bulletproofs ZK Service',
      address: '0x5678901234567890123456789012345678901234',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Efficient ZK range proofs using Bulletproofs technology. Our service provides compact zero-knowledge proofs without a trusted setup, making it ideal for cryptocurrency applications and privacy-preserving smart contracts.',
      restakersCount: 6,
      operatorsCount: 1,
      tvl: '$60',
    },
    {
      name: 'ZK-STARK Engine',
      address: '0x6789012345678901234567890123456789012345',
      category: BlueprintCategory.CATEGORY_3,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Scalable ZK-STARK proof generation service.',
      restakersCount: 20,
      operatorsCount: 5,
      tvl: '$200',
    },
    {
      name: 'Ligero ZK Platform',
      address: '0x7890123456789012345678901234567890123456',
      category: BlueprintCategory.CATEGORY_3,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Lightweight ZK proof service using the Ligero protocol. We offer fast and efficient zero-knowledge proofs suitable for IoT devices and resource-constrained environments.',
      restakersCount: 7,
      operatorsCount: 2,
      tvl: '$70',
    },
    {
      name: 'Aurora ZK Cloud',
      address: '0x8901234567890123456789012345678901234567',
      category: BlueprintCategory.CATEGORY_2,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Cloud-based ZK proofs.',
      restakersCount: 18,
      operatorsCount: 4,
      tvl: '$180',
    },
    {
      name: 'Fractal ZK Services',
      address: '0x9012345678901234567890123456789012345678',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Recursive ZK proof generation using fractal architecture. Our innovative approach allows for highly scalable and efficient proofs, enabling complex computations to be verified quickly and securely.',
      restakersCount: 14,
      operatorsCount: 3,
      tvl: '$140',
    },
    {
      name: 'Halo2 ZK Platform',
      address: '0xa123456789012345678901234567890123456789',
      category: BlueprintCategory.CATEGORY_2,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'ZK proofs with Halo2 system.',
      restakersCount: 16,
      operatorsCount: 3,
      tvl: '$160',
    },
    {
      name: 'Nova ZK Accelerator',
      address: '0xb234567890123456789012345678901234567890',
      category: BlueprintCategory.CATEGORY_2,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'High-performance ZK proof generation leveraging the Nova protocol. We specialize in accelerating zero-knowledge computations for blockchain scaling solutions and privacy-preserving applications.',
      restakersCount: 11,
      operatorsCount: 2,
      tvl: '$110',
    },
    {
      name: 'Hydra ZK Network',
      address: '0xc345678901234567890123456789012345678901',
      category: BlueprintCategory.CATEGORY_3,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Distributed ZK proofs.',
      restakersCount: 25,
      operatorsCount: 6,
      tvl: '$250',
    },
    {
      name: 'Quantum ZK Solutions',
      address: '0xd456789012345678901234567890123456789012',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Next-generation ZK proofs leveraging quantum-resistant algorithms. Our cutting-edge service ensures long-term security for zero-knowledge applications, protecting against potential threats from quantum computing advancements.',
      restakersCount: 9,
      operatorsCount: 2,
      tvl: '$90',
    },
    {
      name: 'Mina ZK Provider',
      address: '0xe567890123456789012345678901234567890123',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Lightweight ZK proofs with Mina.',
      restakersCount: 13,
      operatorsCount: 3,
      tvl: '$130',
    },
    {
      name: 'ZK Rollup Express',
      address: '0xf678901234567890123456789012345678901234',
      category: BlueprintCategory.CATEGORY_1,
      imgUrl:
        'https://images.unsplash.com/photo-1641194255129-bd39dd8112de?q=80&w=2380&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Specialized ZK proof service for Layer 2 rollups. Our platform enables high-throughput, low-cost transactions on Ethereum by leveraging zero-knowledge proofs to compress and verify batches of transactions off-chain.',
      restakersCount: 22,
      operatorsCount: 5,
      tvl: '$220',
    },
  ];
}
