export enum FindingType {
  Normal = "normal",
  Retraction = "retraction",
  Perforation = "perforation",
  Effusion = "effusion",
  Tympanoslerosis = "tympanosclerosis",
  Cholesteatoma = "cholesteatoma",
  Inflammation = "inflammation",
  Cerumen = "cerumen",
  ForeignBody = "foreign_body",
  Tube = "tube",
  Myringitis = "myringitis",
  Neomembrane = "neomembrane",
}

export enum QuadrantName {
  AnteriorSuperior = "anterior_superior",
  AnteriorInferior = "anterior_inferior",
  PosteriorSuperior = "posterior_superior",
  PosteriorInferior = "posterior_inferior",
  ParsFlaccida = "pars_flaccida",
}

export interface QuadrantMark {
  quadrant: QuadrantName;
  finding: FindingType;
}

export interface EarMarks {
  marks: QuadrantMark[];
}

export interface EarFindings {
  normal: boolean;
  retraction: boolean;
  perforation: boolean;
  effusion: boolean;
  tympanosclerosis: boolean;
  cholesteatoma: boolean;
  inflammation: boolean;
  cerumen: boolean;
  foreign_body: boolean;
  tube: boolean;
  myringitis: boolean;
  neomembrane: boolean;
  cae_normal: boolean;
  cae_edema: boolean;
  cae_exostosis: boolean;
  cae_otorrhea: boolean;
}

export const DEFAULT_EAR_FINDINGS: EarFindings = {
  normal: true,
  retraction: false,
  perforation: false,
  effusion: false,
  tympanosclerosis: false,
  cholesteatoma: false,
  inflammation: false,
  cerumen: false,
  foreign_body: false,
  tube: false,
  myringitis: false,
  neomembrane: false,
  cae_normal: true,
  cae_edema: false,
  cae_exostosis: false,
  cae_otorrhea: false,
};
