export interface HaloPosts {
  page: number;
  size: number;
  total: number;
  items: Item[];
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
}

export interface Item {
  post: Post;
  categories: Category[];
  tags: Tag[];
  contributors: Owner[];
  owner: Owner;
  stats: Stats;
}

export interface Category {
  spec: CategorySpec;
  status: CategoryStatus;
  apiVersion: string;
  kind: string;
  metadata: CategoryMetadata;
}

export interface CategoryMetadata {
  finalizers: string[];
  name: string;
  annotations: PurpleAnnotations;
  version: number;
  creationTimestamp: string;
}

export interface PurpleAnnotations {
  "content.halo.run/permalink-pattern": string;
  "content.halo.run/last-hidden-state": string;
}

export interface CategorySpec {
  displayName: string;
  slug: string;
  priority: number;
  children: any[];
  preventParentPostCascadeQuery: boolean;
  hideFromList: boolean;
}

export interface CategoryStatus {
  permalink: string;
  postCount: number;
  visiblePostCount: number;
  observedVersion?: number;
}

export interface Owner {
  displayName: string;
  avatar: string;
  name: string;
}

export interface Post {
  spec: PostSpec;
  status: PostStatus;
  apiVersion: string;
  kind: string;
  metadata: PostMetadata;
}

export interface PostMetadata {
  finalizers: string[];
  name: string;
  labels: Labels;
  annotations: FluffyAnnotations;
  version: number;
  creationTimestamp: string;
}

export interface FluffyAnnotations {
  "content.halo.run/preferred-editor": string;
  "checksum/config": string;
  "content.halo.run/permalink-pattern": string;
  "content.halo.run/last-associated-categories": string;
  "content.halo.run/last-associated-tags": string;
  "content.halo.run/last-released-snapshot": string;
}

export interface Labels {
  "content.halo.run/published": string;
  "content.halo.run/deleted": string;
  "content.halo.run/owner": string;
  "content.halo.run/visible": string;
  "content.halo.run/archive-year": string;
  "content.halo.run/archive-month": string;
  "content.halo.run/archive-day": string;
}

export interface PostSpec {
  title: string;
  slug: string;
  releaseSnapshot: string;
  headSnapshot: string;
  baseSnapshot: string;
  owner: string;
  template: string;
  cover: string;
  deleted: boolean;
  publish: boolean;
  publishTime: string;
  pinned: boolean;
  allowComment: boolean;
  visible: string;
  priority: number;
  excerpt: Excerpt;
  categories: string[];
  tags: string[];
  htmlMetas: any[];
}

export interface Excerpt {
  autoGenerate: boolean;
  raw: string;
}

export interface PostStatus {
  phase: string;
  conditions: Condition[];
  permalink: string;
  excerpt: string;
  inProgress: boolean;
  contributors: string[];
  hideFromList: boolean;
  lastModifyTime: string;
  observedVersion: number;
}

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime: string;
  message: string;
  reason: string;
}

export interface Stats {
  visit: number;
  upvote: number;
  totalComment: number;
  approvedComment: number;
}

export interface Tag {
  spec: TagSpec;
  status: CategoryStatus;
  apiVersion: string;
  kind: string;
  metadata: TagMetadata;
}

export interface TagMetadata {
  generateName: string;
  finalizers: string[];
  name: string;
  annotations: TentacledAnnotations;
  version: number;
  creationTimestamp: string;
}

export interface TentacledAnnotations {
  "content.halo.run/permalink-pattern": string;
}

export interface TagSpec {
  displayName: string;
  slug: string;
  color: string;
  cover: string;
}

export interface HaloLinks {
  page: number;
  size: number;
  total: number;
  items: Item[];
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
}

export interface Item {
  spec: Spec;
  apiVersion: string;
  kind: string;
  metadata: Metadata;
}

export interface Metadata {
  generateName: string;
  name: string;
  annotations: object;
  version: number;
  creationTimestamp: string;
}

export interface Spec {
  url: string;
  displayName: string;
  logo: string;
  description?: string;
}

export interface Content {
  snapshotName: string;
  raw: string;
  content: string;
  rawType: string;
}
