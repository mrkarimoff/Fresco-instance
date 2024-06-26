import {
  caseProperty,
  entityAttributesProperty,
  entityPrimaryKeyProperty,
  protocolName,
  sessionExportTimeProperty,
  sessionFinishTimeProperty,
  sessionProperty,
} from '@codaco/shared-consts';
import { omit } from 'lodash';
import {
  getEntityAttributes,
  nodeTypePropertyForWorker,
  primaryKeyPropertyForWorker,
} from '../ducks/modules/network';

/**
 * Internally, 'attributes' are stored with UUID keys, which are meaningless to the end user.
 * This resolves those UUIDs to variable names based on the definitions in the variable registry,
 * appropriate for user scripts and export.
 *
 * If `ignoreExternalProps` is false (the default), and a key is not not found, the resulting entity
 * will contain the original key/val. (This may happen with imported external data.)
 *
 * @private
 */
export const getEntityAttributesWithNamesResolved = (
  entity,
  entityVariables,
  ignoreExternalProps = false,
) => {
  if (!entityVariables) {
    return {};
  }
  const attrs = getEntityAttributes(entity);
  return Object.keys(attrs).reduce((acc, uuid) => {
    if (entityVariables[uuid] && entityVariables[uuid].name) {
      acc[entityVariables[uuid].name] = attrs[uuid];
    } else if (!ignoreExternalProps) {
      acc[uuid] = attrs[uuid];
    }
    return acc;
  }, {});
};

/**
 * Given a variable name ("age") and the relevant section of the variable registry, returns the
 * ID/key for that name.
 */
const getVariableIdFromName = (variableName, variableDefinitions) => {
  const entry = Object.entries(variableDefinitions).find(
    ([, variable]) => variable.name === variableName,
  );
  return entry && entry[0];
};

/**
 * The inverse of getEntityAttributesWithNamesResolved
 */
export const getNodeWithIdAttributes = (node, nodeVariables) => {
  if (!nodeVariables) {
    return {};
  }
  const attrs = getEntityAttributes(node);
  const mappedAttrs = Object.keys(attrs).reduce((acc, varName) => {
    const variableId = getVariableIdFromName(varName, nodeVariables);
    if (variableId) {
      acc[variableId] = attrs[varName];
    }
    return acc;
  }, {});

  return {
    ...node,
    [entityAttributesProperty]: mappedAttrs,
  };
};

/**
 * Contains all user attributes flattened with the node's unique ID & type.
 *
 *`primaryKeyPropertyForWorker` and `nodeTypePropertyForWorker` are used to minimize conflicts,
 * but user data is always preserved in the event of conflicts.
 *
 * @param  {Object} entity
 * @param  {Object} entityTypeDefinition The codebook entry for this entity type
 * @return {Object} entity data safe to supply to user-defined workers.
 */
export const asWorkerAgentEntity = (entity, entityTypeDefinition) => ({
  [primaryKeyPropertyForWorker]: entity[entityPrimaryKeyProperty],
  [nodeTypePropertyForWorker]:
    entityTypeDefinition && entityTypeDefinition.name,
  ...getEntityAttributesWithNamesResolved(
    entity,
    (entityTypeDefinition || {}).variables,
  ),
});

export const asWorkerAgentEdge = (edge, edgeTypeDefinition) => ({
  ...omit(edge, entityAttributesProperty),
  ...asWorkerAgentEntity(edge, edgeTypeDefinition),
});

/**
 * Produces a network suitable for worker scripts.
 *
 * @param  {Object} network  the entire network (in redux state)
 * @param  {Object} registry the codebook from a protocol
 * @return {Object} workerNetwork
 */
export const asWorkerAgentNetwork = (network = {}, registry = {}) => {
  const { nodes = [], edges = [], ego = {} } = network;
  const {
    node: nodeRegistry = {},
    edge: edgeRegistry = {},
    ego: egoRegistry = {},
  } = registry;
  return {
    nodes: nodes.map((node) =>
      asWorkerAgentEntity(node, nodeRegistry[node.type]),
    ),
    edges: edges.map((edge) =>
      asWorkerAgentEdge(edge, edgeRegistry[edge.type]),
    ),
    ego: asWorkerAgentEntity(ego, egoRegistry),
  };
};
