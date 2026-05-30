// GSIs to synchronize on the local table at startup and provision in infrastructure.
// ElectroDB names GSI keys gsi{n}pk / gsi{n}sk — add one entry per index defined in your entities.
export const GLOBAL_SECONDARY_INDEXES = [
  {
    indexName: 'gsi1pk-gsi1sk-index',
    partitionKey: 'gsi1pk',
    sortKey: 'gsi1sk',
  },
  {
    indexName: 'gsi2pk-gsi2sk-index',
    partitionKey: 'gsi2pk',
    sortKey: 'gsi2sk',
  },
  {
    indexName: 'gsi3pk-gsi3sk-index',
    partitionKey: 'gsi3pk',
    sortKey: 'gsi3sk',
  },
  {
    indexName: 'gsi4pk-gsi4sk-index',
    partitionKey: 'gsi4pk',
    sortKey: 'gsi4sk',
  },
];
