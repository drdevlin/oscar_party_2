import { pb } from '@/lib/pb.server';
import { Back } from '@/components/Back';
import { Category } from '@/components/Category';

import type { RecordModel } from 'pocketbase';
import type { Category as CategoryType } from '@/lib/types';

export interface CategoriesProps {
  params: Promise<{ playerId: string, categoryId: string }>;
}
export default async function Categories({ params }: CategoriesProps) {
  const { playerId, categoryId } = await params;
  const nominations = parse(
    await pb.collection('nominations').getFullList({
      filter: `category="${categoryId}"`,
      expand: 'category, nominee',
    })
  );
  const [{ categoryName }] = nominations;

  return (
    <>
      <div>
        <Back href={`/${playerId}`} />
        <h1>{categoryName}</h1>
      </div>
      <Category playerId={playerId} categoryId={categoryId} nominations={nominations} />
    </>
  );
}

export const generateStaticParams = async () => {
  const categories = await pb.collection('categories').getFullList() as CategoryType[];

  return categories.map(({ id }) => ({ categoryId: id }));
};

// Helpers
export interface CategoryNomination {
  id: string;
  categoryName: string;
  nomineeName: string;
}
const parse = (records: RecordModel[]): CategoryNomination[] => {
  return records.map((record) => ({
    id: record.id,
    categoryName: record?.expand?.category?.name,
    nomineeName: record?.expand?.nominee?.name,
  }));
};
