import {
  type NcNetwork,
  caseProperty,
  codebookHashProperty,
  protocolName,
  protocolProperty,
  sessionExportTimeProperty,
  sessionFinishTimeProperty,
  sessionProperty,
  sessionStartTimeProperty,
  type NcNode,
  type NcEntity,
  type NcEdge,
} from '@codaco/shared-consts';
import { hash } from 'ohash';
import { env } from '~/env.mjs';
import type { RouterOutputs } from '~/trpc/shared';

type FormattedSession = {
  ego: NcEntity | undefined;
  nodes: NcNode[];
  edges: NcEdge[];
  sessionVariables: {
    [caseProperty]: string;
    [sessionProperty]: string;
    [protocolProperty]: string;
    [protocolName]: string;
    [codebookHashProperty]: string;
    [sessionExportTimeProperty]: string;
    [sessionStartTimeProperty]?: string;
    [sessionFinishTimeProperty]?: string;
    COMMIT_HASH: string;
    APP_VERSION: string;
  };
};

export type FormattedSessions = FormattedSession[];

/**
 * Creates an object containing all required session metadata for export
 * and appends it to the session
 */

export const formatExportableSessions = (
  sessions: RouterOutputs['interview']['get']['forExport'],
) => {
  return sessions.map((session) => {
    const sessionProtocol = session.protocol;
    const sessionParticipant = session.participant;

    const sessionVariables = {
      // Label is optional, so fallback to identifier because caseProperty is used
      // to create the filename during export.
      [caseProperty]: sessionParticipant.label ?? sessionParticipant.identifier,
      [sessionProperty]: session.id,
      [protocolProperty]: sessionProtocol.hash,
      [protocolName]: sessionProtocol.name,
      [codebookHashProperty]: hash(sessionProtocol.codebook),
      ...(session.startTime && {
        [sessionStartTimeProperty]: new Date(session.startTime).toISOString(),
      }),
      ...(session.finishTime && {
        [sessionFinishTimeProperty]: new Date(session.finishTime).toISOString(),
      }),
      [sessionExportTimeProperty]: new Date().toISOString(),
      COMMIT_HASH: env.COMMIT_HASH,
      APP_VERSION: env.APP_VERSION,
    };

    const sessionNetwork = session.network as unknown as NcNetwork;

    return {
      ...sessionNetwork,
      sessionVariables,
    } as FormattedSession;
  });
};
