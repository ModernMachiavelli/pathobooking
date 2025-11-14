// src/components/doctor-card.tsx
import { Doctor } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type DoctorWithOptional = Doctor;

interface DoctorCardProps {
  doctor: DoctorWithOptional;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="flex flex-row items-center gap-4">
        {doctor.avatarUrl && (
          <img
            src={doctor.avatarUrl}
            alt={doctor.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <div>
          <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
          <CardDescription>
            {doctor.specialization}
            {doctor.subSpecialization ? ` • ${doctor.subSpecialization}` : ''}
          </CardDescription>
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>
              {doctor.city}, {doctor.region}
            </span>
            {doctor.clinicName && <span>• {doctor.clinicName}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {doctor.description && (
          <p className="text-sm text-muted-foreground">{doctor.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {doctor.isTelepathologyAvailable && (
            <Badge variant="default">Телепатологія</Badge>
          )}
          {doctor.isAcceptingNewPatients ? (
            <Badge variant="outline">Приймає нових пацієнтів</Badge>
          ) : (
            <Badge variant="outline">Тимчасово без запису</Badge>
          )}
          {doctor.yearsOfExperience && (
            <Badge variant="secondary">
              Досвід {doctor.yearsOfExperience}+ років
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}