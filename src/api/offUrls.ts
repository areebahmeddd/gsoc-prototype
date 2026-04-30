import { browser } from "#imports";
import type {
  EcoScoreGrade,
  FopWarningKey,
  NovaGroup,
  NutriScoreGrade,
} from "./offTypes";

export function nutriScoreUrl(grade: NutriScoreGrade): string {
  return browser.runtime.getURL(
    `score/nutriscore/nutriscore-${grade}-new-en.svg`,
  );
}

export function novaGroupUrl(group: NovaGroup): string {
  return browser.runtime.getURL(`score/nova/nova-group-${group}.svg`);
}

export function ecoScoreUrl(grade: EcoScoreGrade): string {
  return browser.runtime.getURL(`score/ecoscore/green-score-${grade}.svg`);
}

export function fopWarningUrl(key: FopWarningKey): string {
  return browser.runtime.getURL(`fop/fop-${key}.svg`);
}

export function fopUnknownUrl(): string {
  return browser.runtime.getURL("fop/fop-unknown.svg");
}
