import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevice1743498401382 implements MigrationInterface {
  name = 'CreateDevice1743498401382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await queryRunner.query(`
        CREATE TABLE "device" (
            "id" SERIAL PRIMARY KEY,
            "name" character varying NOT NULL,
            "lastUpdate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "status" integer DEFAULT 0,
            "position" geometry(Point, 4326) NOT NULL DEFAULT ST_SetSRID(ST_MakePoint(0, 0), 4326),
            "userId" integer NOT NULL,
            "role" integer DEFAULT 0,
            "deviceKey" character varying UNIQUE NOT NULL,
            "deviceToken" character varying NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_device_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
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
