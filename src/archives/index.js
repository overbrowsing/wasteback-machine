import { arq } from "./arq/arq.js";
import { awa } from "./awa/awa.js";
import { cz } from "./cz/cz.js";
import { gcwa } from "./gcwa/gcwa.js";
import { ia } from "./ia/ia.js";
import { iwa } from "./iwa/iwa.js";
import { loc } from "./loc/loc.js";
import { nliwa } from "./nliwa/nliwa.js";
import { nzwa } from "./nzwa/nzwa.js";
import { pwa } from "./pwa/pwa.js";
import { slo } from "./slo/slo.js";
import { ukgwa } from "./ukgwa/ukgwa.js";
import { ukwa } from "./ukwa/ukwa.js";

export const archives = {
  [arq.id]: arq,
  [awa.id]: awa,
  [cz.id]: cz,
  [gcwa.id]: gcwa,
  [loc.id]: loc,
  [ia.id]: ia,
  [iwa.id]: iwa,
  [nliwa.id]: nliwa,
  [nzwa.id]: nzwa,
  [pwa.id]: pwa,
  [slo.id]: slo,
  [ukgwa.id]: ukgwa,
  [ukwa.id]: ukwa
};