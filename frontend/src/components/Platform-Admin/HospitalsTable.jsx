import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HospitalsView({
  hospitals,
  loading,
  open,
  setOpen,
  form,
  setForm,
  submitting,
  updatingId,
  onCreate,
  onToggleStatus,
  navigate,

  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  districtFilter,
  setDistrictFilter,
  page,
  setPage,
  totalPages,
}) {
  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Hospitals
        </h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Hospital</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hospital</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onCreate(form)
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Hospital Name</Label>
                <Input
                  value={form.hospitalName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hospitalName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={form.district}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      district: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Hospital Admin Email</Label>
                <Input
                  type="email"
                  value={form.managerEmail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      managerEmail: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Hospital"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">

        <Input
          placeholder="Search hospital..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="md:max-w-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1)
            setStatusFilter(e.target.value)
          }}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Suspended</option>
        </select>

        <Input
          placeholder="Filter by district..."
          value={districtFilter}
          onChange={(e) => {
            setPage(1)
            setDistrictFilter(e.target.value)
          }}
          className="md:max-w-xs"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-lg border bg-background">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading hospitals...
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hospitals found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {hospitals.map((h) => (
                <TableRow key={h._id}>
                  <TableCell className="font-medium">
                    {h.name}
                  </TableCell>

                  <TableCell>{h.district}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        h.isActive
                          ? "default"
                          : "destructive"
                      }
                    >
                      {h.isActive
                        ? "ACTIVE"
                        : "SUSPENDED"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(
                      h.createdAt
                    ).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/platform/hospitals/${h._id}`
                        )
                      }
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant={
                        h.isActive
                          ? "destructive"
                          : "default"
                      }
                      disabled={updatingId === h._id}
                      onClick={() =>
                        onToggleStatus(h)
                      }
                    >
                      {updatingId === h._id
                        ? "Updating..."
                        : h.isActive
                        ? "Suspend"
                        : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-end items-center gap-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => p + 1)
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}