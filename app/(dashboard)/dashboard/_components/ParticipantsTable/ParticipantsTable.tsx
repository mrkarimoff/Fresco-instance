'use client';
import { DataTable } from '~/components/DataTable/DataTable';
import { useParticipants } from '../ParticipantsProvider';
import { ParticipantColumns } from './Columns';
import { deleteParticipants } from '../../participants/_actions/actions';

export const ParticipantsTable = () => {
  const { isLoading, participants } = useParticipants();

  if (isLoading || !participants) {
    return 'Loading...';
  }

  return (
    <DataTable
      columns={ParticipantColumns}
      data={participants}
      filterColumnAccessorKey="identifier"
      deleteAction={deleteParticipants}
    />
  );
};
