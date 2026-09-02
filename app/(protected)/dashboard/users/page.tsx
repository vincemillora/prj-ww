import Link from 'next/link';
import { requireSuperadmin } from '@/lib/dal';
import { getUsers } from '@/lib/data';
import { activateUser, deactivateUser } from './actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  pending: 'secondary',
  disabled: 'destructive',
};
const ROLE_VARIANT: Record<string, 'default' | 'outline'> = {
  superadmin: 'default',
  admin: 'outline',
};

const TH = 'label-caps text-muted-foreground';

export default async function UsersPage() {
  const current = await requireSuperadmin();
  const rows = await getUsers();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="self-start text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        ← Back to dashboard
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Approve pending admins so they can sign in. You cannot change your own account.
        </p>
      </div>
      <Card className="gap-0 overflow-hidden rounded-[18px] py-0 shadow-[0_1px_1px_color-mix(in_srgb,var(--ink)_7%,transparent),0_4px_14px_color-mix(in_srgb,var(--ink)_5%,transparent)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 pt-5 pb-4 sm:px-6">
          <h2 className="text-xl leading-none text-foreground">Admin accounts</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-secondary-foreground">
            {rows.length}
          </span>
        </div>
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className={TH}>Email</TableHead>
                <TableHead className={TH}>Name</TableHead>
                <TableHead className={TH}>Role</TableHead>
                <TableHead className={TH}>Status</TableHead>
                <TableHead className={cn(TH, 'text-right')}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const locked = u.id === current.id || u.role === 'superadmin';
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {locked ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : u.status === 'active' ? (
                        <form action={deactivateUser} className="inline-block">
                          <input type="hidden" name="userId" value={u.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Deactivate
                          </Button>
                        </form>
                      ) : (
                        <form action={activateUser} className="inline-block">
                          <input type="hidden" name="userId" value={u.id} />
                          <Button type="submit" size="sm">
                            Activate
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
