-- Hand-mapped FDA/CE additions applied on top of fda-ce-seed.sql (already run
-- against the live DB). These are products whose medicaplanet name differs
-- enough from medicadepot's that the auto-matcher skipped them; each was
-- verified by hand against medicadepot's rendered badge. After this the live
-- totals are 37 FDA / 217 CE.

begin;

-- CE-marked (medicadepot shows CE, no FDA)
update products set ce_marked = true where id in (
  '9b0e513e-3b96-4c56-83cc-5a30f417be52', -- ALIAXIN® SV            -> aliaxin-superior-volume
  'ca55ce05-0a8c-4800-8ab5-22e1e533fd8d', -- FERULAC NANO ADDITIVE MIST -> mediderma-ferulac-nano-additive-mist
  '7a81f494-03cb-48af-a422-7119a52a6c44', -- FERULAC PEEL PLUS       -> mediderma-ferulac-peel-plus
  'efd89950-e32b-47f6-8b16-b2302d4e34d5', -- FILORGA® LIGHT PEEL     -> fillmed-light-peel (Fillmed = Filorga pro rebrand)
  'fd718bda-0433-46b4-a28d-d91ada1950fe', -- FILORGA® POST PEEL      -> fillmed-post-peel
  '8204039b-40cc-4ba5-8286-c91412f650e8', -- FILORGA® PRE PEEL       -> fillmed-pre-peel
  '1fc27de1-4e65-4e88-b8ed-4c2b1ccbbb0b', -- FILORGA® TIME PEEL      -> fillmed-time-peel
  '2bc508d3-c059-4ce3-a93d-ba513e64ecbb', -- JALUPRO® 2x30mg/3ml     -> jalupro-online
  'bf92bc4c-b265-48e9-bf53-10b0a4bf7ce3', -- PERFECTHA® FINELINES    -> perfectha-fine-lines
  '25826c63-2e5e-4d53-8970-b8ca5f025cad', -- REDNESS CONTROL A&A     -> redness-control-aa-sensitive-gel-mediderma
  '68bb0e98-af13-4215-a1a3-0fd550d2bd88'  -- VISCODERM® SKINKÒ       -> viscoderm-skinko-e-viscoderm-skinko-kit
);

-- FDA + CE
update products set fda_approved = true, ce_marked = true where id in (
  'c630da9c-2542-4d36-bb75-183dc12257cc', -- RESTYLANE® LYFT               (= Perlane, FDA-approved)
  '549274a8-0f20-436d-9e60-f5e39934c39d', -- RESTYLANE® LYFT with Lidocaine
  'e133964e-5394-47e4-bc5c-c64f7baf34c4'  -- SYNVISC ONE®                  (FDA-approved)
);

commit;
