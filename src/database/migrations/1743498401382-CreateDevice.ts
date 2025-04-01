import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevice1743498401382 implements MigrationInterface {
  name = 'CreateDevice1743498401382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await queryRunner.query(`
        CREATE TABLE "device" (
            "id" SERIAL PRIMARY KEY,
            "name" character varying NOT NULL,
            "last_update" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "status" integer DEFAULT 1,  -- 1 represents ONLINE status
            "position" geometry(Point, 4326) NOT NULL,
            "user_id" integer NOT NULL,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_device_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        );

        CREATE INDEX "idx_device_position" ON "device" USING GIST ("position");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "idx_device_position";
        DROP TABLE "device";
    `);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis;`);
  }
}
