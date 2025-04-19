const inputs = [
  {
    name: 'cpuPrice',
    label: 'CPU Price',
    description: 'Price per CPU core per hour',
    placeholder: '0.00',
  },
  {
    name: 'memPrice',
    label: 'Memory Price',
    description: 'Price per MB of memory per hour',
    placeholder: '0.00',
  },
  {
    name: 'hddStoragePrice',
    label: 'HDD Storage Price',
    description: 'Price per GB of HDD storage per hour',
    placeholder: '0.00',
  },
  {
    name: 'ssdStoragePrice',
    label: 'SSD Storage Price',
    description: 'Price per GB of SSD storage per hour',
    placeholder: '0.00',
  },
  {
    name: 'nvmeStoragePrice',
    label: 'NVMe Storage Price',
    description: 'Price per GB of NVMe storage per hour',
    placeholder: '0.00',
  },
] as const;

export default inputs;
