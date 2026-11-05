"use client";

/**
 * useVariantSelection
 *
 * A self-contained hook that manages all variant-selection state for a product.
 *
 * Usage:
 *   const variant = useVariantSelection(rawProduct);
 *
 *   // Read:
 *   variant.selectedVariant       – the currently matched variant object (or null)
 *   variant.selectedOptionsType   – array of { types, values } for each dimension
 *   variant.variantOptionTypes    – unique option types (e.g. Size, Color)
 *   variant.hasVariants           – true when the product actually has selectable options
 *   variant.isOptionAvailable     – fn(optionType, optionValue) → boolean
 *   variant.getValuesForType      – fn(optionType) → option value array for that type
 *   variant.displayImages         – images to show (swaps to variant images when selected)
 *
 *   // Write:
 *   variant.selectOption(optionValue, optionType) – pick an option chip
 */

import { useState, useEffect } from "react";
import { flatten, map, uniqBy, filter, compact } from "lodash";

export function useVariantSelection(rawProduct: any) {
  const [selectedOptionsType, setSelectedOptionsType] = useState<any[]>([]);

  // ─── 1. Build a flat list of every (optionType → optionValue) pair ───────
  const allVariantOptions = flatten(
    map(rawProduct?.variants, (variant) =>
      map(variant?.variant_options, (variantOption) => ({
        types: variantOption.option_type,
        values: {
          ...variantOption.option_value,
          // Attach variant image when applicable (e.g. Color swatches)
          image:
            variantOption.option_type?.name?.toLowerCase() === "color"
              ? variant.product_images?.[0]
              : "",
          variant_id: variantOption?.variant?.id,
          // All variant IDs that share this option value (useful for filtering)
          variant_ids: flatten(
            compact(
              map(rawProduct?.variants, (v) => {
                const matched = filter(v?.variant_options, [
                  "option_value.id",
                  variantOption?.option_value?.id,
                ]);
                return matched?.length ? v?.id : false;
              })
            )
          ),
        },
      }))
    )
  );

  // ─── 2. Unique option *types* (e.g. [{id: 1, name: "Size"}, …]) ─────────
  // We filter out undefined to skip "master" variants that have no options.
  const variantOptionTypes = uniqBy(
    map(allVariantOptions, (v) => v?.types).filter(Boolean),
    "id"
  );

  const hasVariants = variantOptionTypes.length > 0;

  // ─── 3. Auto-select first in-stock variant when product loads ────────────
  useEffect(() => {
    if (!rawProduct?.variants?.length || !hasVariants) return;

    const firstVariant =
      rawProduct.variants.find((v: any) => v.in_stock || v.purchasable) ??
      rawProduct.variants[0];

    if (!firstVariant?.variant_options?.length) return;

    const autoSelections = firstVariant.variant_options.map((vo: any) => ({
      types: vo.option_type,
      values: vo.option_value,
    }));

    setSelectedOptionsType(autoSelections);
    // Re-run only when the product (id) changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawProduct?.id]);

  // ─── 4. Derive the fully-matched variant from current selections ──────────
  const selectedVariant = (() => {
    if (!selectedOptionsType.length || !rawProduct?.variants?.length) return null;
    return (
      rawProduct.variants.find((variant: any) =>
        selectedOptionsType.every((sel) =>
          variant.variant_options.some(
            (vo: any) =>
              vo.option_type?.id === sel.types?.id &&
              vo.option_value?.id === sel.values?.id
          )
        )
      ) ?? null
    );
  })();

  // ─── 5. Availability check ────────────────────────────────────────────────
  // An option chip is enabled only when at least one IN-STOCK variant has it.
  // We intentionally avoid cross-type constraints here — instead the auto-fill
  // logic in selectOption() snaps other types to a valid combo automatically.
  const isOptionAvailable = (optionType: any, optionValue: any) => {
    if (!rawProduct?.variants?.length) return false;
    return rawProduct.variants.some(
      (variant: any) =>
        (variant.in_stock || variant.purchasable) &&
        variant.variant_options.some(
          (vo: any) =>
            vo.option_type?.id === optionType?.id &&
            vo.option_value?.id === optionValue?.id
        )
    );
  };

  // ─── 6. Get all option values for a specific option type ─────────────────
  const getValuesForType = (optionType: any) => {
    if (!rawProduct?.variants) return [];
    const seen = new Set();
    const vals: any[] = [];
    rawProduct.variants.forEach((v: any) => {
      v.variant_options?.forEach((vo: any) => {
        if (
          vo.option_type?.id === optionType?.id &&
          !seen.has(vo.option_value?.id)
        ) {
          seen.add(vo.option_value?.id);
          vals.push(vo.option_value);
        }
      });
    });
    return vals;
  };

  // ─── 7. Handle chip selection ─────────────────────────────────────────────
  const selectOption = (optionValue: any, optionType: any) => {
    setSelectedOptionsType((prev) => {
      // Toggle off if the same chip is tapped again
      const isAlreadySelected = prev.some(
        (s) => s.types?.id === optionType?.id && s.values?.id === optionValue?.id
      );
      if (isAlreadySelected) {
        return prev.filter((s) => s.types?.id !== optionType?.id);
      }

      // Replace the selection for this type with the new value
      const withNewValue = [
        ...prev.filter((p) => p.types?.id !== optionType?.id),
        { types: optionType, values: optionValue },
      ];

      // Try to find a variant that satisfies ALL current + new selections
      const exactMatch = rawProduct?.variants?.find((v: any) =>
        withNewValue.every((sel) =>
          v.variant_options.some(
            (vo: any) =>
              vo.option_type?.id === sel.types?.id &&
              vo.option_value?.id === sel.values?.id
          )
        )
      );

      // If no exact match, fall back to "nearest" variant that at least has
      // the newly-selected value, then auto-fill the rest from it
      const matchingVariant =
        exactMatch ??
        rawProduct?.variants?.find((v: any) =>
          v.variant_options.some(
            (vo: any) =>
              vo.option_type?.id === optionType?.id &&
              vo.option_value?.id === optionValue?.id
          )
        );

      if (!matchingVariant) return withNewValue;

      // Auto-fill all other option types from the matched variant
      const autoFilled = [{ types: optionType, values: optionValue }];
      matchingVariant.variant_options.forEach((vo: any) => {
        if (vo.option_type?.id === optionType?.id) return;
        if (!autoFilled.some((s) => s.types?.id === vo.option_type?.id)) {
          autoFilled.push({ types: vo.option_type, values: vo.option_value });
        }
      });

      return autoFilled;
    });
  };

  // ─── 8. Resolve display images ────────────────────────────────────────────
  // Swap to variant-specific images when a variant with images is selected.
  const getDisplayImages = (productImages: any[] = []) => {
    if (!selectedVariant?.product_images?.length) return productImages;
    return selectedVariant.product_images.map((img: any) => ({
      id: img.id,
      position: img.position ?? 0,
      url: img.product_image_url ?? null,
      videoUrl: img.product_video_url ?? null,
    }));
  };

  return {
    /** Array of { types, values } for whatever the user has selected */
    selectedOptionsType,
    /** The matched product variant (null if no full match yet) */
    selectedVariant,
    /** Unique option types array, e.g. [Size, Color] */
    variantOptionTypes,
    /** True when the product has at least one selectable option type */
    hasVariants,
    /** fn(optionType, optionValue) → boolean – drives the disabled state of chips */
    isOptionAvailable,
    /** fn(optionType) → option value array – used to render chips per type */
    getValuesForType,
    /** Call when user taps an option chip */
    selectOption,
    /**
     * fn(fallbackImages) → image array
     * Pass your product's default images; the hook swaps them for variant
     * images when a variant with images is selected.
     */
    getDisplayImages,
  };
}
