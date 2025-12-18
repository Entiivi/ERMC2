"use client";

import { ProjectForm, ProjectFormProps } from "../ProjectForm";

export function ProjectFormSection(
  props: ProjectFormProps & { onClose: () => void }
) {
  return (
    <div className="mt-4">
      <ProjectForm {...props} onCancelEdit={props.onClose} />
    </div>
  );
}
